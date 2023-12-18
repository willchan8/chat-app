import { useState, useRef, ChangeEvent } from "react";
import firebase from "firebase/compat/app";

import { useCollectionData } from "react-firebase-hooks/firestore";

const auth = firebase.auth();
const firestore = firebase.firestore();

function ChatRoom() {
	const scrollRef = useRef<HTMLDivElement>(null);

	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);

	// @ts-ignore
	const [messages] = useCollectionData(query, { idField: "id" });

	const [messageInput, setMessageInput] = useState("");

	const sendMessage = async (e: React.SyntheticEvent) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser!;

		await messagesRef.add({
			text: messageInput,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL
		});

		setMessageInput("");

		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setMessageInput(e.target.value);
	};

	return (
		<>
			<main>
				{messages && messages.map((msg: any, i: number) => <ChatMessage key={`${msg.uid}_${i}`} message={msg} />)}
				<div ref={scrollRef}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input value={messageInput} onChange={handleChange} placeholder="Enter Message..." />
				<button type="submit" disabled={messageInput.length === 0}>
					Send ➡️
				</button>
			</form>
		</>
	);
}

function ChatMessage({ message }: { message: any }) {
	const { text, uid, photoURL } = message;

	const messageClass = uid === auth?.currentUser?.uid ? "sent" : "received";

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} />
			<p>{text}</p>
		</div>
	);
}

export default ChatRoom;
