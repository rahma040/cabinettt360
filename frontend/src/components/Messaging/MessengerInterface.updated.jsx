// PATCH: Add these lines after the handleSendMessage function (around line 330)
// This adds file input handling and preview functionality

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
      onChange={handleFileSelect}
      style={{ display: "none" }}
    />
    <button
      type="button"
      className="input-icon-btn"
      title="Pièce jointe"
      onClick={() => fileInputRef.current?.click()}
    >
      <FaPaperclip size={18} />
    </button>

// AND BEFORE: <form onSubmit={handleSendMessage}> (around line 590)
// Add this file preview UI:

                {filePreview && (
                  <div style={{ padding: "8px 12px", background: "#F0F2F5", borderRadius: "8px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                      {filePreview.type.startsWith("image/") ? (
                        <img src={filePreview.preview} alt="preview" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", background: "#E5E7EB", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaFilePdf size={20} style={{ color: "#F43F5E" }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: "500", color: "#0A0F1E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{filePreview.name}</div>
                        <div style={{ fontSize: "11px", color: "#65676B" }}>{(filePreview.file.size / 1024).toFixed(2)} KB</div>
                      </div>
                    </div>
                    <button onClick={removeFilePreview} type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#65676B", fontSize: "16px" }}>✕</button>
                  </div>
                )}
