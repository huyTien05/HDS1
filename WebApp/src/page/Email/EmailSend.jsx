import {
  Box,
  Badge,
  InputBase,
  CircularProgress,
  Button,
  Divider,
  TextField,
  Paper,
  Typography,
  Avatar
} from "@mui/material";
import { useEffect, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import DeleteIcon from "@mui/icons-material/Delete";

/* ================= MAIN ================= */

export default function MailLayout() {
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [currentFolder, setCurrentFolder] = useState("inbox"); // inbox | sent | trash
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); 

  useEffect(() => {
    fetchMails();
  }, []);

  const fetchMails = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5225/api/email/queue");
      const data = await res.json();
      // map backend → UI
      const mapped = data.map(mapMail);
      setMails(mapped);

      if (mapped.length > 0) {
        setSelectedMail(mapped[0]);
      }
    } catch (e) {
      console.error("Fetch mail error", e);
    } finally {
      setLoading(false);
    }
  };

  /* FILTER THEO FOLDER */
  const filteredMails = mails.filter((mail) => {
    if (currentFolder === "inbox") return true;          // TẤT CẢ
    if (currentFolder === "sent") return mail.type === "sent";
    if (currentFolder === "trash") return mail.type === "trash";
    return true;
  });

return (
  <Box
    display="flex"
    height="100vh"
    bgcolor="#f5f6f7"
    position="fixed"
    top={0}
    left={300}
    right={0}
    zIndex={1000}>
    {/* ================= SIDEBAR (LUÔN HIỂN THỊ) ================= */}
    <Box
      flex="0 0 220px"
      bgcolor="#fff"
      borderRight="1px solid #e0e0e0"
      overflow="auto">
      <Sidebar
        currentFolder={currentFolder}
        onChange={(value) => {
          if (value === "compose") {
            setMode("compose");
            setSelectedMail(null);
          } else {
            setMode("list");
            setCurrentFolder(value);
            setSelectedMail(null);
          }
        }}/>
    </Box>

    {/* ================= MAIN CONTENT (2 CỘT) ================= */}
    {mode === "compose" ? (
    <Box
    flex={1}
    bgcolor="#f5f6f7"
    overflow="auto"
    display="flex"
    alignItems="flex-start"
    justifyContent="flex-start">
    <Box
      width="100%"
      minHeight="100%"
      bgcolor="#fff">
      <ComposeMail
        onCancel={() => setMode("list")}
        onSuccess={() => {
          fetchMails();
          setMode("list");
        }}/>
    </Box>
  </Box>
    ) : (
      /* ===== MAIL LIST + DETAIL ===== */
      <>
        {/* MAIL LIST */}
        <Box
          flex="0 0 360px"
          bgcolor="#fff"
          borderRight="1px solid #e0e0e0"
          overflow="auto">
          <SearchBox />
          <Divider />

          {loading ? (
            <Box p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            filteredMails.map((mail) => (
              <MailItem
                key={mail.id}
                mail={mail}
                active={mail.id === selectedMail?.id}
                onClick={() => setSelectedMail(mail)}/>
            ))
          )}
        </Box>

        {/* MAIL DETAIL */}
        <Box
          flex="1 1 auto"
          minWidth={500}
          bgcolor="#fff"
          overflow="auto">
          {selectedMail ? (
            <MailDetail mail={selectedMail}/>
          ) : (
            <Box
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center">
              <Typography color="text.secondary">
                Chọn email để xem nội dung
              </Typography>
            </Box>
          )}
        </Box>
      </>
    )}
  </Box>
);
}
/* ================= HELPERS ================= */
const mapMail = (m) => ({
  id: m.id,
  to: m.to,
  subject: m.subject,
  body: m.body,
  time: new Date(m.sentAt).toLocaleString("vi-VN"),
  isSuccess: m.isSuccess,
  type: "sent" // backend hiện tại là mail gửi
});
/* ================= SIDEBAR ================= */
function Sidebar({ currentFolder, onChange }) {
  return (
    <>
      <Box p={2} display="flex" alignItems="center" gap={1}>
        <MailOutlineIcon color="primary" />
        <Typography fontWeight={600}>Hộp thư</Typography>
        <Badge color="primary" badgeContent={0} sx={{ ml: "auto" }} />
      </Box>
      <Divider />
      <SidebarItem
        icon={<MailOutlineIcon />}
        label="Hộp thư"
        active={currentFolder === "inbox"}
        onClick={() => onChange("inbox")}/>

      <SidebarItem
        icon={<MailOutlineIcon />}
        label="Soạn thư"
        onClick={() => onChange("compose")}/>

      <SidebarItem
        icon={<SendIcon />}
        label="Đã gửi"
        active={currentFolder === "sent"}
        onClick={() => onChange("sent")}/>

      <SidebarItem
        icon={<DeleteOutlineIcon />}
        label="Thùng rác"
        active={currentFolder === "trash"}
        onClick={() => onChange("trash")}/>
    </>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <Box
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={1.5}
      px={2}
      py={1.2}
      sx={{
        cursor: "pointer",
        bgcolor: active ? "#e3f2fd" : "transparent",
        "&:hover": { bgcolor: "#f5f5f5" }
      }}> {icon}
      <Typography fontWeight={active ? 600 : 400}> {label} </Typography>
    </Box>
  );
}
/* ================= SEARCH ================= */
function SearchBox() {
  return (
    <Box p={1.5} display="flex" alignItems="center">
      <SearchIcon color="action"/>
      <InputBase placeholder="Search..." sx={{ ml: 1, flex: 1 }} />
    </Box>
  );
}
/* ================= MAIL ITEM ================= */
function MailItem({ mail, active, onClick }) {
  return (
    <Box
      px={2}
      py={1.5}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        bgcolor: active ? "#e3f2fd" : "transparent",
        borderBottom: "1px solid #f0f0f0",
        "&:hover": { bgcolor: "#f9f9f9" }
      }}>
      <Box display="flex" justifyContent="space-between">
        <Typography fontWeight={600} fontSize={14}>
          {mail.to}
        </Typography>

        <Typography variant="caption">
          {mail.time}
        </Typography>
      </Box>

      <Typography fontSize={13} color="text.secondary">
        {mail.subject}
      </Typography>
    </Box>
  );
}
/* ================= MAIL DETAIL ================= */
function MailDetail({ mail }) {
  return (
    <Box p={3}>
      <Typography variant="h6">{mail.subject}</Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        To {mail.to} • {mail.time}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography>{mail.body}</Typography>
    </Box>
  );
}

function ComposeMail({ onCancel, onSuccess }) {
  const [to, setTo] = useState("");
  const [toError, setToError] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5225/api/email/send-gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body })
      });

      const data = await res.json();

      if (!res.ok) {
      throw new Error(data.message || "Gửi email thất bại");
    }
      alert(data.message || "Gửi email thành công!");
      setTo("");
      setSubject("");
      setBody("");
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi khi gửi email");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box display="flex" justifyContent="left" px={3}>
    <Paper elevation={3} sx={{ mt: 5, p: 3 }}>
      <Typography variant="h5" gutterBottom>Soạn Email</Typography>

      <TextField
        fullWidth
        label="Gửi tới"
        margin="normal"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        error={!!toError}
        helperText={toError}
        placeholder="vd: devhd10@hdsoft.vn"/>

      <TextField
        fullWidth
        label="Tiêu đề"
        margin="normal"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}/>

      <TextField
        fullWidth
        label="Nội dung Email"
        margin="normal"
        multiline
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}/>

      <Box textAlign="right" mt={2}>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi Email"}
        </Button>
      </Box>
    </Paper>
  </Box>
  );
}

