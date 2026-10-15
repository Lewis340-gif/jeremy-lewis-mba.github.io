#!/usr/bin/env python3
import os
import sys
import json
import shutil
from http.server import SimpleHTTPRequestHandler, HTTPServer

PORT = 8000
SITE_DIR = os.path.dirname(os.path.abspath(__file__))
JS_FILE = os.path.join(SITE_DIR, 'ai-gov.js')
BAK_FILE = os.path.join(SITE_DIR, 'ai-gov.js.bak')

class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SITE_DIR, **kwargs)

    def end_headers(self):
        # Prevent caching for js/css/html during active development
        if self.path.endswith(('.html', '.js', '.css', '.json')):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        # Validate Editor Authorization header
        editor_auth = self.headers.get('X-Editor-Auth')
        if editor_auth != 'granted':
            err_data = json.dumps({"status": "error", "error": "Editor authorization required to modify files."}).encode('utf-8')
            self.send_response(403)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(err_data)))
            self.end_headers()
            self.wfile.write(err_data)
            print("[AUTH ERROR] Blocked unauthorized save attempt (missing or invalid X-Editor-Auth header)")
            return

        if self.path == '/api/save-content':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(post_body)
                stages = payload.get('stages')

                if not stages or not isinstance(stages, list):
                    raise ValueError("Payload missing valid 'stages' array.")

                # Backup original ai-gov.js
                if os.path.exists(JS_FILE):
                    shutil.copyfile(JS_FILE, BAK_FILE)

                # Read existing ai-gov.js
                with open(JS_FILE, 'r', encoding='utf-8') as f:
                    js_code = f.read()

                # Locate LIFECYCLE_STAGES block
                start_marker = 'const LIFECYCLE_STAGES = ['
                start_idx = js_code.find(start_marker)
                if start_idx == -1:
                    raise ValueError(f"Could not locate '{start_marker}' in {JS_FILE}")

                end_marker = 'const MATURITY_LEVELS = ['
                end_idx = js_code.find(end_marker, start_idx)
                if end_idx == -1:
                    raise ValueError(f"Could not locate '{end_marker}' in {JS_FILE}")

                semi_idx = js_code.rfind('];', start_idx, end_idx) + 2

                # Format formatted JSON for stages
                formatted_stages = json.dumps(stages, indent=4, ensure_ascii=False)
                new_block = f"const LIFECYCLE_STAGES = {formatted_stages};"

                # Splice into js_code
                updated_code = js_code[:start_idx] + new_block + js_code[semi_idx:]

                with open(JS_FILE, 'w', encoding='utf-8') as f:
                    f.write(updated_code)

                # Send response
                response_data = json.dumps({
                    "status": "ok",
                    "message": "Lifecycle content saved successfully to ai-gov.js",
                    "stagesCount": len(stages)
                }).encode('utf-8')

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                print(f"[SAVE] Successfully saved {len(stages)} stages to {JS_FILE}")

            except Exception as e:
                err_data = json.dumps({"status": "error", "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                print(f"[SAVE ERROR] {e}", file=sys.stderr)

        elif self.path in ('/api/save-page', '/api/save-alignment'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(post_body)
                page_name = payload.get('page', 'ai-gov-alignment.html')
                html_content = payload.get('html')

                if not html_content or not isinstance(html_content, str):
                    raise ValueError("Payload missing valid 'html' string content.")

                safe_name = os.path.basename(page_name)
                if not safe_name.endswith('.html'):
                    raise ValueError("Only .html files can be saved via this endpoint.")

                target_file = os.path.join(SITE_DIR, safe_name)
                bak_file = target_file + '.bak'

                # Backup original file
                if os.path.exists(target_file):
                    shutil.copyfile(target_file, bak_file)

                with open(target_file, 'w', encoding='utf-8') as f:
                    f.write(html_content)

                response_data = json.dumps({
                    "status": "ok",
                    "message": f"Page content saved successfully to {safe_name}",
                    "bytes": len(html_content)
                }).encode('utf-8')

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                print(f"[SAVE PAGE] Successfully saved {len(html_content)} bytes to {safe_name}")

            except Exception as e:
                err_data = json.dumps({"status": "error", "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                print(f"[SAVE PAGE ERROR] {e}", file=sys.stderr)
        else:
            self.send_response(404)
            self.end_headers()

def run():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, DevHandler)
    print(f"Development server with visual save API running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == '__main__':
    run()
