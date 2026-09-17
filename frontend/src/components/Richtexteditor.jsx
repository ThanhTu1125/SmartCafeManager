import React, { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/* Trình soạn thảo rich text dùng react-quill (controlled component).
   Props: value (HTML), onChange (html => void)

   react-quill là controlled: value đổi -> editor tự cập nhật, KHÔNG cần
   thao tác innerHTML thủ công. Đây là điểm khác biệt quan trọng so với
   bản contentEditable cũ (vốn hay bị "không nạp được content khi sửa").

   React 19: nếu lỗi findDOMNode, đổi 2 dòng import sang "react-quill-new". */
function RichTextEditor({ value, onChange }) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = ["header", "bold", "italic", "underline", "list", "align", "link", "image"];

  return (
    <div className="rte">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Nhập nội dung tin tức..."
      />
    </div>
  );
}

export default RichTextEditor;