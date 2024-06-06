import React, { useState, useRef } from "react";
import { Hourglass } from "react-loader-spinner";
import Tesseract from "tesseract.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import FloatingIcon from "./FloatingIcon";
import { FaCopy } from "react-icons/fa";

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showImageAndText, setShowImageAndText] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputResetRef = useRef<HTMLInputElement>(null); // New ref for resetting the file input

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (fileType.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
        setShowImageAndText(true); // Show the image and text areas
        setIsLoading(true); // Start loading
        // OCR Processing
        try {
          const { data } = await Tesseract.recognize(file, "eng", {
            logger: (m) => console.log(m),
          });
          const blocks = data.blocks || [];
          const formattedText = blocks
            .map((block) => {
              const blockText = block.text.trim();
              if (!blockText) return ""; // Skip empty blocks

              return `<p class="paragraph">${blockText}</p>`;
            })
            .join("");

          setText(formattedText);
        } catch (error) {
          console.error("OCR Error:", error);
        } finally {
          setIsLoading(false); // Stop loading after OCR is done (success or error)
        }
      } else {
        setShowErrorModal(true); // Show the error modal
      }
    }
  };

  const handleClear = () => {
    setShowImageAndText(false); // Hide the image and text areas
    setImage(null); // Reset the image state
    setText(""); // Reset the text state
    if (fileInputResetRef.current) {
      fileInputResetRef.current.value = ""; // Reset the file input value
    }
  };

  const handleCloseErrorModal = () => setShowErrorModal(false); // Function to close the modal

  const copyToClipboard = () => {
    const textWithoutHtmlTags = text.replace(/<[^>]+>/g, ""); // Remove HTML tags
    navigator.clipboard
      .writeText(textWithoutHtmlTags)
      .then(() => {
        // Show a nice animation or notification when the text is copied
        setShowCopiedNotification(true);
        setTimeout(() => {
          setShowCopiedNotification(false);
        }, 2000); // Hide the notification after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="container mt-5">
      <header
        className="d-flex justify-content-center align-items-center mb-5"
        style={{ backgroundColor: "#f0f0f0", padding: "2rem" }}
      >
        <h3 className="text-center text-dark">
          Image to text convertor - Vite + React + TS + Bootstrap CSS +
          Tesseract.js
        </h3>
      </header>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        style={{ display: "none" }} // Hide the default input
      />
      {/* Add a new hidden input for resetting the file input value */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputResetRef}
        style={{ display: "none" }}
      />

      <div className="d-flex justify-content-center">
        <button
          className="btn btn-primary mb-3 me-2"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Image
        </button>
        <button className="btn btn-secondary mb-3" onClick={handleClear}>
          Clear
        </button>
      </div>

      {showImageAndText && image && (
        <div className="row">
          <div className="col-md-6">
            <img src={image} alt="Selected" className="img-fluid mb-3" />
          </div>
          <div className="col-md-6 position-relative">
            <div className="border p-3 chatgpt-response">
              <h4 className="text-center mb-2">Extracted Text:</h4>

              <div className="d-flex justify-content-center">
                {isLoading ? (
                  <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    colors={["#306cce", "#72a1ed"]}
                  />
                ) : (
                  <div
                    className="extracted-text"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                )}
              </div>
              {text && (
                <FaCopy
                  className="position-absolute top-0 end-0 m-4"
                  style={{ cursor: "pointer" }}
                  onClick={copyToClipboard}
                  title="copy text"
                />
              )}
            </div>
          </div>
        </div>
      )}
      <Modal
        show={showErrorModal}
        onHide={handleCloseErrorModal}
        centered // Center the modal
      >
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-danger">
          Please upload an image file.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseErrorModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <FloatingIcon />
      {showCopiedNotification && (
        <div className="copied-notification">
          <span>Text copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

export default App;