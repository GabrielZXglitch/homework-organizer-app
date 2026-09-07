import pty, os, sys, time

pid, fd = pty.fork()
if pid == 0:
    os.environ["PATH"] = os.environ.get("PATH", "") + ":" + os.path.expanduser("~/.local/bin")
    os.execvp("gh", ["gh", "auth", "login", "-w"])
else:
    def k(key):
        time.sleep(2.5)
        os.write(fd, key)

    k(b"\r") # account
    k(b"\r") # protocol
    k(b"Y\r") # auth git
    k(b"\r") # how to auth
    k(b"\r") # browser (press enter to open browser)
    
    time.sleep(3)
    
    for _ in range(20):
        try:
            data = os.read(fd, 1024).decode(errors="ignore")
            print(data, end='')
            sys.stdout.flush()
            time.sleep(0.5)
        except OSError:
            break
