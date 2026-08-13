import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { getMe } from "../../services/authService";

// ========================================
// ADMIN QUICK REPLIES
// ========================================

const QUICK_REPLIES = [
  "How can I help you sir?",
  "Please Wait sir",
  "Cheeking",
  "Success",
];

const Messages = () => {
  // ========================================
  // USER / ADMIN
  // ========================================

  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  // ========================================
  // MESSAGES
  // ========================================

  const [messages, setMessages] = useState([]);

  // ========================================
  // ADMIN CONVERSATIONS
  // ========================================

  const [conversations, setConversations] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  // ========================================
  // MESSAGE INPUT
  // ========================================

  const [messageText, setMessageText] =
    useState("");

  // ========================================
  // FILE
  // ========================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [filePreview, setFilePreview] =
    useState("");

  // ========================================
  // STATES
  // ========================================

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // REFS
  // ========================================

  const messagesEndRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  // ========================================
  // CHECK ADMIN
  // ========================================

  const isAdmin =
    user?.role === "admin";

  // ========================================
  // GET CURRENT USER
  // ========================================

  const loadUser = async () => {
    try {
      const response =
        await getMe();

      const currentUser =
        response?.user ||
        response?.data ||
        response;

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error(
        "Load user error:",
        error
      );

      setError(
        "Unable to load your account."
      );

      return null;
    }
  };

  // ========================================
  // GET ADMIN
  // ========================================

  const loadAdmin = async () => {
    try {
      const response =
        await api.get(
          "/messages/admin"
        );

      const data =
        response?.data?.data ||
        response?.data;

      setAdmin(data);

      return data;
    } catch (error) {
      console.error(
        "Load admin error:",
        error
      );

      setError(
        "Admin support account not found."
      );

      return null;
    }
  };

  // ========================================
  // GET ADMIN INBOX
  // ========================================

  const loadInbox = async () => {
    try {
      const response =
        await api.get(
          "/messages/inbox"
        );

      const data =
        response?.data?.data || [];

      setConversations(data);

      return data;
    } catch (error) {
      console.error(
        "Load inbox error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load admin inbox."
      );

      return [];
    }
  };

  // ========================================
  // GET CONVERSATION
  // ========================================

  const loadConversation =
    async (userId) => {
      if (!userId) {
        return;
      }

      try {
        const response =
          await api.get(
            `/messages/conversation/${userId}`
          );

        const data =
          response?.data?.data || [];

        setMessages(data);
      } catch (error) {
        console.error(
          "Load conversation error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load conversation."
        );
      }
    };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    const initialize =
      async () => {
        setLoading(true);
        setError("");

        const currentUser =
          await loadUser();

        if (!currentUser) {
          setLoading(false);
          return;
        }

        // ==================================
        // ADMIN
        // ==================================

        if (
          currentUser.role ===
          "admin"
        ) {
          const inbox =
            await loadInbox();

          if (inbox.length > 0) {
            setSelectedUser(
              inbox[0].user
            );

            await loadConversation(
              inbox[0].user._id
            );
          }
        }

        // ==================================
        // NORMAL USER
        // ==================================

        else {
          const adminData =
            await loadAdmin();

          if (adminData) {
            await loadConversation(
              currentUser._id
            );
          }
        }

        setLoading(false);
      };

    initialize();
  }, []);

  // ========================================
  // LIVE CHAT REFRESH
  // ========================================

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    const interval =
      setInterval(
        async () => {
          // ==================================
          // ADMIN
          // ==================================

          if (
            user.role ===
            "admin"
          ) {
            const inbox =
              await loadInbox();

            const selectedId =
              selectedUser?._id;

            if (selectedId) {
              await loadConversation(
                selectedId
              );
            } else if (
              inbox.length > 0
            ) {
              setSelectedUser(
                inbox[0].user
              );

              await loadConversation(
                inbox[0].user._id
              );
            }
          }

          // ==================================
          // USER
          // ==================================

          else {
            await loadConversation(
              user._id
            );
          }
        },
        3000
      );

    return () =>
      clearInterval(interval);
  }, [
    user,
    selectedUser?._id,
  ]);

  // ========================================
  // AUTO SCROLL
  // ========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  // ========================================
  // CLEAN PREVIEW URL
  // ========================================

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(
          filePreview
        );
      }
    };
  }, [filePreview]);

  // ========================================
  // SELECT ADMIN CONVERSATION
  // ========================================

  const selectConversation =
    async (conversation) => {
      const selected =
        conversation?.user;

      if (!selected?._id) {
        return;
      }

      setSelectedUser(
        selected
      );

      setMessages([]);

      setError("");

      await loadConversation(
        selected._id
      );

      await loadInbox();
    };

  // ========================================
  // SELECT FILE
  // ========================================

  const handleFileChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      // ==================================
      // 10 MB LIMIT
      // ==================================

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "File size must be 10 MB or less."
        );

        event.target.value = "";

        return;
      }

      // ==================================
      // REMOVE OLD PREVIEW
      // ==================================

      if (filePreview) {
        URL.revokeObjectURL(
          filePreview
        );
      }

      setSelectedFile(
        file
      );

      setError("");

      // ==================================
      // IMAGE PREVIEW
      // ==================================

      if (
        file.type.startsWith(
          "image/"
        )
      ) {
        setFilePreview(
          URL.createObjectURL(
            file
          )
        );
      } else {
        setFilePreview("");
      }
    };

  // ========================================
  // CLEAR SELECTED FILE
  // ========================================

  const clearSelectedFile =
    () => {
      if (filePreview) {
        URL.revokeObjectURL(
          filePreview
        );
      }

      setSelectedFile(null);

      setFilePreview("");

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  // ========================================
  // SEND MESSAGE
  // ========================================

  const handleSendMessage =
    async (
      quickText = null
    ) => {
      const text = (
        quickText ??
        messageText
      ).trim();

      // Allow:
      // text only
      // file only
      // text + file

      if (
        !text &&
        !selectedFile
      ) {
        return;
      }

      // ==================================
      // FIND RECEIVER
      // ==================================

      const receiverId =
        isAdmin
          ? selectedUser?._id
          : admin?._id;

      if (!receiverId) {
        setError(
          isAdmin
            ? "Select a user first."
            : "Admin account not found."
        );

        return;
      }

      try {
        setSending(true);

        setError("");

        // ==================================
        // FORM DATA
        // ==================================

        const formData =
          new FormData();

        formData.append(
          "receiverId",
          receiverId
        );

        formData.append(
          "text",
          text
        );

        if (selectedFile) {
          formData.append(
            "file",
            selectedFile
          );
        }

        // ==================================
        // SEND TO SERVER
        // ==================================

        const response =
          await api.post(
            "/messages",
            formData
          );

        const newMessage =
          response?.data?.data;

        // ==================================
        // ADD IMMEDIATELY
        // ==================================

        if (newMessage) {
          setMessages(
            (previous) => [
              ...previous,
              newMessage,
            ]
          );
        }

        // ==================================
        // CLEAR INPUT
        // ==================================

        setMessageText("");

        clearSelectedFile();

        // ==================================
        // REFRESH ADMIN INBOX
        // ==================================

        if (isAdmin) {
          await loadInbox();
        }
      } catch (error) {
        console.error(
          "Send message error:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Message could not be sent."
        );
      } finally {
        setSending(false);
      }
    };

  // ========================================
  // ENTER TO SEND
  // ========================================

  const handleKeyDown =
    (event) => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        handleSendMessage();
      }
    };

  // ========================================
  // FORMAT TIME
  // ========================================

  const formatTime =
    (date) => {
      if (!date) {
        return "";
      }

      return new Date(
        date
      ).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  // ========================================
  // GET FILE URL
  // ========================================

  const getFileUrl =
    (message) => {
      if (
        !message?.fileUrl
      ) {
        return "";
      }

      if (
        message.fileUrl.startsWith(
          "http"
        )
      ) {
        return message.fileUrl;
      }

      const configuredBase =
        api?.defaults
          ?.baseURL || "";

      const base =
        configuredBase.replace(
          /\/api\/?$/,
          ""
        );

      if (base) {
        return `${base}${message.fileUrl}`;
      }

      return message.fileUrl;
    };

  // ========================================
  // RENDER ATTACHMENT
  // ========================================

  const renderAttachment =
    (message) => {
      if (
        !message?.fileUrl
      ) {
        return null;
      }

      const url =
        getFileUrl(message);

      const type =
        message.fileType ||
        "";

      const isImage =
        type.startsWith(
          "image/"
        );

      // ==================================
      // IMAGE
      // ==================================

      if (isImage) {
        return (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={
              styles.attachmentLink
            }
          >
            <img
              src={url}
              alt={
                message.fileName ||
                "Attachment"
              }
              style={
                styles.attachmentImage
              }
            />
          </a>
        );
      }

      // ==================================
      // NORMAL FILE
      // ==================================

      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={
            styles.fileLink
          }
        >
          <span
            style={
              styles.fileIcon
            }
          >
            📎
          </span>

          <span
            style={
              styles.fileName
            }
          >
            {message.fileName ||
              "Attached file"}
          </span>
        </a>
      );
    };

  // ========================================
  // MESSAGE BUBBLE
  // ========================================

  const renderMessageBubble =
    (message) => {
      const senderId =
        message?.sender?._id ||
        message?.sender;

      const mine =
        senderId?.toString() ===
        user?._id?.toString();

      return (
        <div
          key={
            message._id
          }
          style={{
            ...styles.row,

            justifyContent:
              mine
                ? "flex-end"
                : "flex-start",
          }}
        >
          <div
            style={{
              ...styles.bubble,

              ...(mine
                ? styles.myBubble
                : styles.userBubble),
            }}
          >
            {/* TEXT */}

            {message.text ? (
              <div>
                {message.text}
              </div>
            ) : null}

            {/* FILE */}

            {renderAttachment(
              message
            )}

            {/* TIME */}

            <small
              style={
                styles.messageTime
              }
            >
              {formatTime(
                message.createdAt
              )}
            </small>
          </div>
        </div>
      );
    };

  // ========================================
  // MESSAGE COMPOSER
  // ========================================

  const renderComposer =
    (placeholder) => (
      <div
        style={
          styles.composerWrap
        }
      >
        {/* ==================================
            QUICK REPLIES
        ================================== */}

        {isAdmin && (
          <div
            style={
              styles.quickReplies
            }
          >
            {QUICK_REPLIES.map(
              (reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      reply
                    )
                  }
                  disabled={
                    sending ||
                    !selectedUser
                  }
                  style={
                    styles.quickReplyButton
                  }
                >
                  {reply}
                </button>
              )
            )}
          </div>
        )}

        {/* ==================================
            SELECTED FILE
        ================================== */}

        {selectedFile && (
          <div
            style={
              styles.filePreviewBox
            }
          >
            {filePreview ? (
              <img
                src={filePreview}
                alt="Selected"
                style={
                  styles.previewImage
                }
              />
            ) : (
              <span
                style={
                  styles.previewFileName
                }
              >
                📎{" "}
                {
                  selectedFile.name
                }
              </span>
            )}

            <button
              type="button"
              onClick={
                clearSelectedFile
              }
              style={
                styles.removeFileButton
              }
            >
              Remove
            </button>
          </div>
        )}

        {/* ==================================
            INPUT
        ================================== */}

        <div
          style={
            styles.inputArea
          }
        >
          {/* HIDDEN FILE INPUT */}

          <input
            ref={
              fileInputRef
            }
            type="file"
            onChange={
              handleFileChange
            }
            style={{
              display: "none",
            }}
            accept="
              image/*,
              .pdf,
              .txt,
              .csv,
              .doc,
              .docx,
              .xls,
              .xlsx,
              .zip
            "
          />

          {/* ATTACH BUTTON */}

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={
              sending
            }
            style={
              styles.attachButton
            }
            title="Attach file or image"
          >
            📎
          </button>

          {/* TEXTAREA */}

          <textarea
            value={
              messageText
            }
            onChange={(e) =>
              setMessageText(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder={
              placeholder
            }
            rows={1}
            maxLength={2000}
            disabled={
              sending
            }
            style={
              styles.textarea
            }
          />

          {/* SEND */}

          <button
            type="button"
            onClick={() =>
              handleSendMessage()
            }
            disabled={
              sending ||
              (
                !messageText.trim() &&
                !selectedFile
              )
            }
            style={
              styles.sendButton
            }
          >
            {sending
              ? "..."
              : "Send"}
          </button>
        </div>
      </div>
    );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div
        className="messages-page"
        style={
          styles.page
        }
      >
        <style>{MOBILE_RESPONSIVE_CSS}</style>
        <div
          style={
            styles.loading
          }
        >
          💬

          <h2>
            Loading Messages...
          </h2>
        </div>
      </div>
    );
  }

  // ========================================
  // ADMIN PAGE
  // ========================================

  if (isAdmin) {
    return (
      <div
        className="messages-page"
        style={
          styles.page
        }
      >
        <style>{MOBILE_RESPONSIVE_CSS}</style>
        <div
          className="messages-admin-card"
          style={
            styles.adminCard
          }
        >
          {/* HEADER */}

          <div
            style={
              styles.header
            }
          >
            <div>
              <h1
                style={
                  styles.title
                }
              >
                Admin Messages
              </h1>

              <span
                style={
                  styles.online
                }
              >
                ● Live Support Inbox
              </span>
            </div>

            <div
              style={
                styles.headerIcon
              }
            >
              💬
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={
                styles.error
              }
            >
              ⚠️ {error}
            </div>
          )}

          {/* ADMIN LAYOUT */}

          <div
            className={`messages-admin-layout ${
              selectedUser
                ? "mobile-chat-open"
                : "mobile-list-open"
            }`}
            style={
              styles.adminLayout
            }
          >
            {/* ==================================
                USER LIST
            ================================== */}

            <div
              className="messages-user-list"
              style={
                styles.userList
              }
            >
              <div
                style={
                  styles.listHeader
                }
              >
                <strong>
                  Conversations
                </strong>

                <span
                  style={
                    styles.count
                  }
                >
                  {
                    conversations.length
                  }
                </span>
              </div>

              {conversations.length ===
              0 ? (
                <div
                  style={
                    styles.noConversation
                  }
                >
                  <div
                    style={
                      styles.emptyIcon
                    }
                  >
                    📭
                  </div>

                  <strong>
                    No messages
                  </strong>

                  <span>
                    User messages
                    will appear
                    here.
                  </span>
                </div>
              ) : (
                conversations.map(
                  (
                    conversation
                  ) => {
                    const chatUser =
                      conversation.user;

                    const selected =
                      selectedUser?._id?.toString() ===
                      chatUser?._id?.toString();

                    return (
                      <button
                        key={
                          chatUser._id
                        }
                        type="button"
                        onClick={() =>
                          selectConversation(
                            conversation
                          )
                        }
                        style={{
                          ...styles.userItem,

                          ...(selected
                            ? styles.selectedUser
                            : {}),
                        }}
                      >
                        <div
                          style={
                            styles.avatar
                          }
                        >
                          {(
                            chatUser.name ||
                            "U"
                          )
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>

                        <div
                          style={
                            styles.userInfo
                          }
                        >
                          <div
                            style={
                              styles.userTop
                            }
                          >
                            <strong>
                              {
                                chatUser.name ||
                                "User"
                              }
                            </strong>

                            {conversation.unreadCount >
                              0 && (
                              <span
                                style={
                                  styles.unread
                                }
                              >
                                {
                                  conversation.unreadCount
                                }
                              </span>
                            )}
                          </div>

                          <span
                            style={
                              styles.email
                            }
                          >
                            {
                              chatUser.email
                            }
                          </span>

                          <span
                            style={
                              styles.lastMessage
                            }
                          >
                            {
                              conversation
                                .lastMessage
                                ?.text ||
                              conversation
                                .lastMessage
                                ?.fileName ||
                              "Attachment"
                            }
                          </span>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>

            {/* ==================================
                CONVERSATION
            ================================== */}

            <div
              className="messages-conversation"
              style={
                styles.conversation
              }
            >
              {!selectedUser ? (
                <div
                  style={
                    styles.emptyState
                  }
                >
                  <div
                    style={
                      styles.bigIcon
                    }
                  >
                    💬
                  </div>

                  <h2>
                    Select a
                    conversation
                  </h2>

                  <p>
                    Select a user
                    from the left
                    side.
                  </p>
                </div>
              ) : (
                <>
                  {/* CHAT HEADER */}

                  <div
                    style={
                      styles.chatHeader
                    }
                  >
                    <button
                      type="button"
                      className="mobile-chat-back"
                      onClick={() => {
                        setSelectedUser(null);
                        setMessages([]);
                        setError("");
                      }}
                      aria-label="Back to conversations"
                    >
                      ‹
                    </button>

                    <div
                      style={
                        styles.avatar
                      }
                    >
                      {(
                        selectedUser.name ||
                        "U"
                      )
                        .charAt(
                          0
                        )
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {
                          selectedUser.name ||
                          "User"
                        }
                      </strong>

                      <span
                        style={
                          styles.chatEmail
                        }
                      >
                        {
                          selectedUser.email
                        }
                      </span>
                    </div>
                  </div>

                  {/* MESSAGES */}

                  <div
                    style={
                      styles.messages
                    }
                  >
                    {messages.length ===
                    0 ? (
                      <div
                        style={
                          styles.emptyState
                        }
                      >
                        <div
                          style={
                            styles.bigIcon
                          }
                        >
                          💬
                        </div>

                        <h3>
                          No messages
                          yet
                        </h3>
                      </div>
                    ) : (
                      messages.map(
                        renderMessageBubble
                      )
                    )}

                    <div
                      ref={
                        messagesEndRef
                      }
                    />
                  </div>

                  {/* COMPOSER */}

                  {renderComposer(
                    "Reply to user..."
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // USER PAGE
  // ========================================

  return (
    <div
      className="messages-page"
      style={
        styles.page
      }
    >
      <style>{MOBILE_RESPONSIVE_CSS}</style>
      <div
        className="messages-user-card"
        style={
          styles.userCard
        }
      >
        {/* HEADER */}

        <div
          style={
            styles.header
          }
        >
          <div>
            <h1
              style={
                styles.title
              }
            >
              Live Support
            </h1>

            <span
              style={
                styles.online
              }
            >
              ● Admin Support
            </span>
          </div>

          <div
            style={
              styles.headerIcon
            }
          >
            💬
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={
              styles.error
            }
          >
            ⚠️ {error}
          </div>
        )}

        {/* MESSAGES */}

        <div
          style={
            styles.messages
          }
        >
          {messages.length ===
          0 ? (
            <div
              style={
                styles.emptyState
              }
            >
              <div
                style={
                  styles.bigIcon
                }
              >
                💬
              </div>

              <h2>
                Start a
                conversation
              </h2>

              <p>
                Send a message
                to Admin
                Support.
              </p>
            </div>
          ) : (
            messages.map(
              renderMessageBubble
            )
          )}

          <div
            ref={
              messagesEndRef
            }
          />
        </div>

        {/* USER COMPOSER */}

        {renderComposer(
          "Type your message..."
        )}
      </div>
    </div>
  );
};

// ========================================
// MOBILE RESPONSIVE CSS
// ========================================

const MOBILE_RESPONSIVE_CSS = `
  .mobile-chat-back {
    display: none;
  }

  @media (max-width: 768px) {
    html, body, #root {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }

    .messages-page {
      width: 100vw !important;
      height: 100dvh !important;
      min-height: 100dvh !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    .messages-admin-card,
    .messages-user-card {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100dvh !important;
      min-height: 100dvh !important;
      margin: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    .messages-admin-card > div:first-child,
    .messages-user-card > div:first-child {
      flex: 0 0 auto !important;
      min-height: 68px !important;
      padding: 12px 14px !important;
      box-sizing: border-box !important;
    }

    .messages-admin-card h1,
    .messages-user-card h1 {
      font-size: 20px !important;
      line-height: 1.15 !important;
      margin: 0 !important;
    }

    .messages-admin-layout {
      width: 100% !important;
      height: calc(100dvh - 68px) !important;
      min-height: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      position: relative !important;
    }

    /* Messenger inbox screen */
    .messages-admin-layout.mobile-list-open .messages-user-list {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
      flex: 1 1 auto !important;
      border: 0 !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      background: #fff !important;
    }

    .messages-admin-layout.mobile-list-open .messages-conversation {
      display: none !important;
    }

    .messages-user-list > div:first-child {
      min-height: 54px !important;
      padding: 15px 16px !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 5 !important;
      background: #fff !important;
    }

    .messages-user-list button {
      width: 100% !important;
      min-height: 74px !important;
      padding: 11px 15px !important;
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      box-sizing: border-box !important;
    }

    .messages-user-list button > div:first-child {
      width: 48px !important;
      height: 48px !important;
      min-width: 48px !important;
      border-radius: 50% !important;
    }

    /* Messenger chat screen */
    .messages-admin-layout.mobile-chat-open .messages-user-list {
      display: none !important;
    }

    .messages-admin-layout.mobile-chat-open .messages-conversation {
      display: flex !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 0 !important;
      flex: 1 1 auto !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    .mobile-chat-back {
      display: flex !important;
      width: 38px !important;
      height: 38px !important;
      min-width: 38px !important;
      align-items: center !important;
      justify-content: center !important;
      border: 0 !important;
      border-radius: 50% !important;
      background: #f0f2f5 !important;
      color: #1c1e21 !important;
      font-size: 30px !important;
      line-height: 1 !important;
      padding: 0 0 4px !important;
      cursor: pointer !important;
    }

    .messages-conversation > div:first-child {
      flex: 0 0 auto !important;
      min-height: 62px !important;
      padding: 8px 12px !important;
      background: #fff !important;
      box-sizing: border-box !important;
    }

    .messages-conversation > div:nth-child(2) {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      width: 100% !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      padding: 14px 10px !important;
      background: #f0f2f5 !important;
      box-sizing: border-box !important;
    }

    .messages-conversation > div:nth-child(2) > div {
      max-width: 84% !important;
    }

    .messages-conversation > div:nth-child(2) > div > div {
      max-width: 100% !important;
      padding: 9px 12px !important;
      border-radius: 18px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      box-sizing: border-box !important;
    }

    .messages-conversation > div:last-child {
      flex: 0 0 auto !important;
      width: 100% !important;
      padding: 7px !important;
      background: #fff !important;
      border-top: 1px solid #e5e7eb !important;
      box-sizing: border-box !important;
    }

    /* Quick replies scroll sideways like Messenger */
    .messages-conversation > div:last-child > div:first-child {
      display: flex !important;
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      gap: 6px !important;
      padding: 0 2px 7px !important;
      scrollbar-width: none !important;
    }

    .messages-conversation > div:last-child > div:first-child::-webkit-scrollbar {
      display: none !important;
    }

    .messages-conversation > div:last-child > div:first-child button {
      flex: 0 0 auto !important;
      white-space: nowrap !important;
      padding: 7px 10px !important;
      font-size: 10px !important;
    }

    .messages-conversation > div:last-child > div:last-child {
      width: 100% !important;
      min-width: 0 !important;
      display: flex !important;
      align-items: flex-end !important;
      gap: 6px !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }

    .messages-conversation textarea {
      min-width: 0 !important;
      width: auto !important;
      flex: 1 1 auto !important;
      min-height: 40px !important;
      max-height: 100px !important;
      padding: 9px 12px !important;
      border-radius: 20px !important;
      font-size: 14px !important;
      box-sizing: border-box !important;
    }

    .messages-conversation button[title="Attach file or image"] {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      border-radius: 50% !important;
      padding: 0 !important;
    }

    .messages-conversation img {
      max-width: min(240px, 75vw) !important;
      height: auto !important;
    }
  }

  @media (max-width: 480px) {
    .messages-admin-card > div:first-child,
    .messages-user-card > div:first-child {
      min-height: 64px !important;
      padding: 10px 12px !important;
    }

    .messages-admin-layout {
      height: calc(100dvh - 64px) !important;
    }

    .messages-admin-card h1,
    .messages-user-card h1 {
      font-size: 19px !important;
    }

    .messages-user-list button {
      min-height: 70px !important;
      padding: 10px 13px !important;
    }
  }

  @media (max-width: 360px) {
    .messages-admin-card h1,
    .messages-user-card h1 {
      font-size: 18px !important;
    }

    .messages-conversation > div:nth-child(2) {
      padding: 10px 7px !important;
    }

    .messages-conversation > div:nth-child(2) > div > div {
      font-size: 13px !important;
      padding: 8px 10px !important;
    }
  }
`;


// ========================================
// STYLES
// ========================================

const styles = {
  page: {
    minHeight:
      "calc(100vh - 80px)",

    padding: "24px",

    boxSizing:
      "border-box",

    background:
      "linear-gradient(135deg, #f7f8ff 0%, #eef3ff 100%)",
  },

  loading: {
    width: "400px",

    margin:
      "100px auto",

    padding: "40px",

    textAlign: "center",

    background: "#fff",

    borderRadius:
      "20px",

    boxShadow:
      "0 15px 40px rgba(0,0,0,.1)",
  },

  adminCard: {
    width: "100%",

    maxWidth:
      "1200px",

    height:
      "calc(100vh - 130px)",

    minHeight:
      "600px",

    margin:
      "0 auto",

    display: "flex",

    flexDirection:
      "column",

    overflow: "hidden",

    borderRadius:
      "22px",

    background: "#fff",

    boxShadow:
      "0 18px 50px rgba(30,41,59,.12)",
  },

  userCard: {
    width: "100%",

    maxWidth:
      "900px",

    height:
      "calc(100vh - 130px)",

    minHeight:
      "600px",

    margin:
      "0 auto",

    display: "flex",

    flexDirection:
      "column",

    overflow: "hidden",

    borderRadius:
      "22px",

    background: "#fff",

    boxShadow:
      "0 18px 50px rgba(30,41,59,.12)",
  },

  header: {
    padding:
      "20px 24px",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    color: "#fff",

    background:
      "linear-gradient(135deg,#5b2be0,#2563eb)",
  },

  title: {
    margin: 0,

    fontSize:
      "21px",
  },

  online: {
    display:
      "block",

    marginTop:
      "5px",

    fontSize:
      "12px",

    color:
      "#bbf7d0",
  },

  headerIcon: {
    fontSize:
      "28px",
  },

  error: {
    margin:
      "10px 20px",

    padding:
      "10px",

    borderRadius:
      "10px",

    color:
      "#b91c1c",

    background:
      "#fef2f2",

    border:
      "1px solid #fecaca",
  },

  adminLayout: {
    flex: 1,

    minHeight: 0,

    display: "flex",
  },

  userList: {
    width:
      "320px",

    flexShrink: 0,

    overflowY:
      "auto",

    borderRight:
      "1px solid #e2e8f0",
  },

  listHeader: {
    padding:
      "17px",

    display: "flex",

    justifyContent:
      "space-between",

    borderBottom:
      "1px solid #e2e8f0",
  },

  count: {
    minWidth:
      "24px",

    padding:
      "3px 7px",

    textAlign:
      "center",

    borderRadius:
      "12px",

    color:
      "#5b2be0",

    background:
      "#eee8ff",

    fontSize:
      "12px",
  },

  userItem: {
    width:
      "100%",

    padding:
      "13px",

    display:
      "flex",

    gap:
      "10px",

    border:
      "none",

    borderBottom:
      "1px solid #f1f5f9",

    background:
      "#fff",

    textAlign:
      "left",

    cursor:
      "pointer",
  },

  selectedUser: {
    background:
      "#f5f3ff",

    boxShadow:
      "inset 4px 0 #5b2be0",
  },

  avatar: {
    width:
      "42px",

    height:
      "42px",

    flexShrink: 0,

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "13px",

    color:
      "#fff",

    background:
      "linear-gradient(135deg,#5b2be0,#2563eb)",

    fontWeight:
      700,
  },

  userInfo: {
    minWidth: 0,

    flex: 1,
  },

  userTop: {
    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      "5px",

    color:
      "#172554",

    fontSize:
      "13px",
  },

  email: {
    display:
      "block",

    marginTop:
      "3px",

    color:
      "#64748b",

    fontSize:
      "10px",

    overflow:
      "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",
  },

  lastMessage: {
    display:
      "block",

    marginTop:
      "4px",

    color:
      "#94a3b8",

    fontSize:
      "11px",

    overflow:
      "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",
  },

  unread: {
    minWidth:
      "20px",

    padding:
      "2px 6px",

    borderRadius:
      "10px",

    color:
      "#fff",

    background:
      "#ef4444",

    textAlign:
      "center",

    fontSize:
      "10px",

    fontWeight:
      700,
  },

  noConversation: {
    padding:
      "50px 20px",

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    gap:
      "8px",

    textAlign:
      "center",

    color:
      "#64748b",

    fontSize:
      "12px",
  },

  conversation: {
    minWidth: 0,

    flex: 1,

    display:
      "flex",

    flexDirection:
      "column",

    background:
      "#f8fafc",
  },

  chatHeader: {
    padding:
      "12px 18px",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "10px",

    background:
      "#fff",

    borderBottom:
      "1px solid #e2e8f0",
  },

  chatEmail: {
    display:
      "block",

    marginTop:
      "2px",

    color:
      "#64748b",

    fontSize:
      "10px",
  },

  messages: {
    flex: 1,

    overflowY:
      "auto",

    padding:
      "20px",
  },

  row: {
    width:
      "100%",

    display:
      "flex",

    marginBottom:
      "12px",
  },

  bubble: {
    maxWidth:
      "70%",

    padding:
      "11px 14px",

    borderRadius:
      "16px",

    fontSize:
      "14px",

    lineHeight:
      1.5,

    wordBreak:
      "break-word",
  },

  myBubble: {
    color:
      "#fff",

    background:
      "linear-gradient(135deg,#5b2be0,#2563eb)",

    borderBottomRightRadius:
      "5px",
  },

  userBubble: {
    color:
      "#1e293b",

    background:
      "#fff",

    border:
      "1px solid #e2e8f0",

    borderBottomLeftRadius:
      "5px",
  },

  emptyState: {
    flex: 1,

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    textAlign:
      "center",

    color:
      "#64748b",
  },

  bigIcon: {
    width:
      "70px",

    height:
      "70px",

    marginBottom:
      "15px",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "22px",

    background:
      "#eee8ff",

    fontSize:
      "30px",
  },

  emptyIcon: {
    fontSize:
      "32px",

    marginBottom:
      "10px",
  },

  // ========================================
  // COMPOSER
  // ========================================

  composerWrap: {
    background:
      "#fff",

    borderTop:
      "1px solid #e2e8f0",
  },

  quickReplies: {
    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      "7px",

    padding:
      "10px 15px 0",
  },

  quickReplyButton: {
    border:
      "1px solid #dbe2ea",

    borderRadius:
      "999px",

    background:
      "#f8fafc",

    color:
      "#334155",

    padding:
      "7px 10px",

    fontSize:
      "11px",

    cursor:
      "pointer",
  },

  inputArea: {
    padding:
      "15px",

    display:
      "flex",

    alignItems:
      "flex-end",

    gap:
      "10px",

    background:
      "#fff",
  },

  attachButton: {
    width:
      "45px",

    height:
      "45px",

    flexShrink: 0,

    border:
      "1px solid #dbe2ea",

    borderRadius:
      "13px",

    background:
      "#fff",

    color:
      "#475569",

    fontSize:
      "19px",

    cursor:
      "pointer",
  },

  textarea: {
    flex: 1,

    minHeight:
      "45px",

    maxHeight:
      "120px",

    padding:
      "12px",

    resize:
      "none",

    border:
      "1px solid #dbe2ea",

    borderRadius:
      "13px",

    outline:
      "none",

    fontFamily:
      "inherit",

    fontSize:
      "14px",

    boxSizing:
      "border-box",
  },

  sendButton: {
    height:
      "45px",

    padding:
      "0 22px",

    border:
      "none",

    borderRadius:
      "13px",

    color:
      "#fff",

    background:
      "linear-gradient(135deg,#5b2be0,#2563eb)",

    fontWeight:
      700,

    cursor:
      "pointer",
  },

  // ========================================
  // FILE PREVIEW
  // ========================================

  filePreviewBox: {
    margin:
      "10px 15px 0",

    padding:
      "8px 10px",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "10px",

    borderRadius:
      "12px",

    background:
      "#f8fafc",

    border:
      "1px solid #e2e8f0",
  },

  previewImage: {
    width:
      "52px",

    height:
      "52px",

    objectFit:
      "cover",

    borderRadius:
      "9px",
  },

  previewFileName: {
    flex: 1,

    minWidth: 0,

    overflow:
      "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",

    fontSize:
      "12px",

    color:
      "#334155",
  },

  removeFileButton: {
    border:
      "none",

    borderRadius:
      "8px",

    padding:
      "6px 9px",

    background:
      "#fee2e2",

    color:
      "#b91c1c",

    cursor:
      "pointer",

    fontSize:
      "11px",
  },

  // ========================================
  // ATTACHMENT
  // ========================================

  attachmentLink: {
    display:
      "block",

    marginTop:
      "7px",
  },

  attachmentImage: {
    display:
      "block",

    maxWidth:
      "240px",

    maxHeight:
      "240px",

    borderRadius:
      "12px",

    objectFit:
      "cover",
  },

  fileLink: {
    marginTop:
      "7px",

    display:
      "flex",

    alignItems:
      "center",

    gap:
      "8px",

    padding:
      "9px 10px",

    borderRadius:
      "10px",

    textDecoration:
      "none",

    background:
      "rgba(255,255,255,.15)",

    color:
      "inherit",
  },

  fileIcon: {
    fontSize:
      "17px",
  },

  fileName: {
    maxWidth:
      "220px",

    overflow:
      "hidden",

    textOverflow:
      "ellipsis",

    whiteSpace:
      "nowrap",
  },

  messageTime: {
    display:
      "block",

    marginTop:
      "5px",

    opacity:
      0.7,

    fontSize:
      "10px",
  },
};

// ========================================
// EXPORT
// ========================================

export default Messages;