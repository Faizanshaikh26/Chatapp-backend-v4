const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://insta-chat-sable.vercel.app",
    process.env.CLIENT_URL,
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

const CHATTU_TOKEN = "chattu-token";
const   INSTACHAT_TOKEN = "InstaCHat-token";

export { corsOptions, CHATTU_TOKEN ,INSTACHAT_TOKEN};
