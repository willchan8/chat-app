import { useState, useRef, ChangeEvent } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_API_KEY,
	authDomain: import.meta.env.VITE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_APP_ID,
	measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
	const [user] = useAuthState(auth as any);

	return (
		<div className="App">
			<header className="App-header">
				<h1>Chat App 💬</h1>
				<SignOut />
			</header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};

	return (
		<button className="sign-in" onClick={signInWithGoogle}>
			Sign in with Google
		</button>
	);
}

function SignOut() {
	return auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function ChatRoom() {
	const scrollRef = useRef<HTMLDivElement>(null);

	const messagesRef = firestore.collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);

	// @ts-ignore
	const [messages] = useCollectionData(query, { idField: "id" });

	const [formValue, setFormValue] = useState("");

	const sendMessage = async (e: React.SyntheticEvent) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser!;

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL
		});

		setFormValue("");

		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setFormValue(e.target.value);
	};

	return (
		<>
			<main>
				{messages && messages.map((msg, i) => <ChatMessage key={`${msg.uid}_${i}`} message={msg} />)}
				<div ref={scrollRef}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input value={formValue} onChange={handleChange} />
				<button type="submit">Send ➡️</button>
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

export default App;
