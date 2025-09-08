import requests
import socketio
import time
import threading

BASE_URL = "http://localhost:3000"

USERS = [
    {"name": f"user{i}", "password": f"pass{i}"}
    for i in range(1, 101)
]

TOKENS = {}
ROOM_ID = None  # we’ll fetch this dynamically

# ---------- REST HELPERS ----------
def register_user(user):
    r = requests.post(f"{BASE_URL}/auth/register", json=user)
    print("Register:", user["name"], r.status_code)

def login_user(user):
    r = requests.post(f"{BASE_URL}/auth/login", json=user)
    if r.ok:
        TOKENS[user["name"]] = r.json()["token"]
        print("Login:", user["name"], "200 ✅")
    else:
        print("Login failed:", user["name"], r.text)

def get_rooms(token):
    r = requests.get(f"{BASE_URL}/rooms", headers={"Authorization": f"Bearer {token}"})
    if r.ok:
        response_data = r.json()
        rooms = response_data.get("rooms", [])  # Extract rooms array from response
        print("Rooms found:", [room["name"] for room in rooms])
        if rooms:
            return rooms[0]["id"]   # Use "id" instead of "_id"
    else:
        print("Get rooms failed:", r.text)
    return None

# ---------- SOCKET CLIENT ----------
def run_client(user, token):
    sio = socketio.Client()

    @sio.on("connect")
    def on_connect():
        print(f"[{user}] ✅ Connected")
        sio.emit("joinRoom", ROOM_ID)

    @sio.on("systemMessage")
    def on_system(msg):
        print(f"[{user}] SYSTEM:", msg)

    @sio.on("chatMessage")
    def on_chat(data):
        print(f"[{user}] CHAT:", data)

    try:
        sio.connect(BASE_URL, auth={"token": token}, transports=["websocket"])
        time.sleep(2)
        sio.emit("chatMessage", {"roomId": ROOM_ID, "message": f"Hello from {user}!"})
        time.sleep(5)
    except Exception as e:
        print(f"[{user}] ❌ Connection error:", e)
    finally:
        sio.disconnect()

# ---------- RUN TEST ----------
if __name__ == "__main__":
    # 1. Register & login users
    for u in USERS:
        register_user(u)
        login_user(u)

    # 2. Get an existing room ID
    ROOM_ID = get_rooms(TOKENS[USERS[0]["name"]])
    if not ROOM_ID:
        print("❌ No rooms available. Please create one as admin before running test.")
        exit(1)
    print("Using ROOM_ID:", ROOM_ID)

    # 3. Start all clients concurrently
    threads = []
    for u in USERS:
        t = threading.Thread(target=run_client, args=(u["name"], TOKENS[u["name"]]))
        t.start()
        threads.append(t)

    for t in threads:
        t.join()
