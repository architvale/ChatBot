const chatBody = document.querySelector(".chat-body"); // Use . for class
const messageInput = document.querySelector(".message-input"); // Ensure this matches your HTML
const sendMessageButton = document.querySelector("#send-message"); // Use # for ID
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper"); // Use . for class
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API Key and URL for the Gemini API

const API_KEY = "AIzaSyBFYkffqzdIow33W_d9Jrl0y2KBzd9OEQ0";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Define your API URL here


const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};
const chatHistory = []; // Initialize chat history array
const initialInputHeight = messageInput.scrollHeight; // Get the initial height of the input field

// Function to create a message element with dynamic classes and render it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};
// Function to generate bot response using the API
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text"); // Select the message text element
    // add user message to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])], // Include file data if available

    });

    // API request options
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",

        },
        body: JSON.stringify({
            contents: chatHistory

        })
    };
    try {
        const response = await fetch(API_URL, requestOptions); // Fetch the response from the API
        const data = await response.json(); // Parse the JSON response
        if (!response.ok) throw new Error(data.error.message); // Handle errors
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim(); // Extract the text from the response
        messageElement.innerText = apiResponseText; // Set the message text to the API response
        // add bot response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText }], // Include file data if available

        });

    }
    catch (error) {

        console.log("Error:", error); // Log any errors that occur during the fetch
        messageElement.innerText = error.message; // Display the error message in the chat
        messageElement.style.color = "#ff0000"; // Change text color to red for error messages
    } finally {
        // Reset user's file data , removing thinking indicator and scrolling to the bottom
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking"); // Remove the thinking class after response
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" }); // Scroll to the bottom
    }

}
// Handle outgoing user messages
const handleOutgoingMessage = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    userData.message = messageInput.value.trim(); // Get user message from input
    messageInput.value = ""; // Clear the input field
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input")); // Trigger input event to reset height
    if (!userData.message) return; // Prevent empty messages
    // Create and display user message
    const messageContent = `<div class="message-text"></div>
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" alt="File Preview" class="attachment">` : ""}`;

    const OutgoingMessage = createMessageElement(messageContent, "user-message");
    OutgoingMessage.querySelector(".message-text").textContent = userData.message; // Set message text
    chatBody.appendChild(OutgoingMessage);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" }); // Scroll to the bottom

    // Simulate bot response after a delay
    setTimeout(() => {
        const messageContent = `  <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                </svg>
                <div class="message-text">
                   <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                   </div>
                </div>`;
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");

        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" }); // Scroll to the bottom
        generateBotResponse(incomingMessageDiv);
    }, 600); // Adjust timeout as needed
};

// Handle Enter Key Press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = messageInput.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) { // Check if Enter is pressed without Shift
        handleOutgoingMessage(e);
    }
});
// Handle input event for auto-resizing the message input field
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`; // Reset height to initial
    messageInput.style.height = `${messageInput.scrollHeight}px`; // Set height to scroll height
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px"; // Adjust chat form height
});
// handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]; // Get the selected file
    if (!file) return; // If no file, return

    const reader = new FileReader(); // Create a FileReader object
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result; // Set the image source to the file data
        fileUploadWrapper.classList.add("file-uploaded"); // Add class to show the uploaded file
        const base64String = e.target.result.split(",")[1]; // Get the base64 string from the result
        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = ""; // Clear the file input after reading
    }
    reader.readAsDataURL(file); // Read the file as a data URL

});
// cancel file upload 
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});
// initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput; // Get the current selection start and end positions
        messageInput.setRangeText(emoji.native, start, end, "end"); // Insert the emoji at the current cursor position
        messageInput.focus(); // Focus back on the input field
    },
    onClickOutside: (e) => {
        if (e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker"); // Toggle class to show/hide the picker
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
}); // Initialize the emoji picker


document.querySelector(".chat-form").appendChild(picker); // Append the picker to the chat form


// Optional: Add click event for the send button
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click()); // Open file input on message input click
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot")); // Toggle chatbot visibility
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot")); // Close chatbot on close button click