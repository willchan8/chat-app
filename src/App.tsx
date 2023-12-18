import { lazy, Suspense } from "react";
import Spinner from "./component/Spinner";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";

const ChatRoom = lazy(() => import("./component/ChatRoom"));

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

function App() {
	const [user, loading] = useAuthState(auth as any);

	return (
		<div className="App">
			<header className="App-header">
				<h1>Chat App 💬</h1>
				<SignOut />
			</header>
			<section>
				{!user && loading && <Spinner />}
				{user && !loading && (
					<Suspense fallback={<Spinner />}>
						<ChatRoom />
					</Suspense>
				)}
				{!user && !loading && <SignIn />}
			</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithRedirect(provider);
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

export default App;
