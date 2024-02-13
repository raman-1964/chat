import { useEffect, useState } from "react";
import io from "socket.io-client";
import Logo from "./components/Logo/Logo";

let socket = null;

function App() {
  const [userName, setUserName] = useState("");
  const [page, setPage] = useState("enter");
  const [chat, setChat] = useState([]);
  const [members, setMembers] = useState(["you"]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (socket) {
      function handleMessage(msg) {
        setChat((prev) => {
          return [...prev, msg];
        });
      }
      function handleUserJoined(msg) {
        setChat((prev) => {
          return [...prev, msg];
        });
        setMembers((prev) => {
          return [...prev, msg.userName];
        });
      }
      function handleLeave(msg) {
        setChat((prev) => {
          return [...prev, msg];
        });
        setMembers((prev) => {
          return prev.filter((mb) => mb != msg.userName);
        });
      }
      function handleAllUser(msg) {
        setMembers((prev) => {
          return [...prev, ...msg.users.filter((ms) => ms != userName)];
        });
      }

      socket.on("leave", handleLeave);
      socket.on("all-user", handleAllUser);
      socket.on("user-joined-msg", handleUserJoined);
      socket.on("recieve-message", handleMessage);
      return () => {
        socket.off("all-user", handleAllUser);
        socket.off("leave", handleLeave);
        socket.off("user-joined-msg", handleUserJoined);
        socket.off("recieve-message", handleMessage);
      };
    }
  }, [socket]);

  return (
    <>
      <nav className="navbar">
        <Logo />
      </nav>
      <div className="main">
        {page === "enter" ? (
          <div className="enter-div">
            <input
              className="input"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => {
                socket = io("http://localhost:5678");
                setPage("chat");
                socket.emit("user-joined", userName);
              }}
            >
              Enter
            </button>
          </div>
        ) : (
          <div className="container">
            <div className="membercont">
              {members.map((mb, ind) => (
                <p key={`${ind}-${mb}`}> {mb},</p>
              ))}
            </div>
            <div className="w-full msg-cont scrollbar">
              {chat.map((msg, ind) => (
                <p
                  key={ind}
                  style={{
                    ...(msg.type === "right" && {
                      alignSelf: "flex-end",
                      background:
                        "linear-gradient(.25turn, rgb(122, 52, 237), 45%, rgb(79, 29, 161))",
                      color: "#fff",
                    }),
                    ...(msg.type === "mid" && {
                      alignSelf: "center",
                      background:
                        "linear-gradient(.25turn, rgb(173, 173, 173), 35%, rgb(245, 245, 245))",
                      color: "#1c1c1c",
                    }),
                  }}
                  className="message"
                >
                  {msg?.from ? (
                    <span
                      style={{
                        display: "block",
                        color: "#341861",
                        fontSize: "0.9rem",
                      }}
                    >
                      ~{msg.from}
                    </span>
                  ) : null}

                  {msg.msg}
                </p>
              ))}
            </div>
            <div className="enter-div flex-row w-full">
              <input
                className="input"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="btn"
                onClick={() => {
                  setChat((prev) => {
                    return [...prev, { msg: message, type: "right" }];
                  });
                  setMessage("");
                  socket.emit("send-message", message);
                }}
              >
                send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
