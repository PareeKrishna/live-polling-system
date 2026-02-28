import Poll from "./models/Poll.js";
import Student from "./models/Student.js";
import Response from "./models/Response.js";
import Message from "./models/Message.js";

const connectedStudents = {}; // socket.id => name mapping

// Get updated list of students after kicking
async function getUpdatedList() {
    const students = await Student.find({ isKicked: false });
    return students.map(s => s.name);
}

export default function socketHandler(socket, io) {
    console.log("New client connected:", socket.id);

    // Student registration
    socket.on("register-student", async ({ name }) => {
        socket.data.name = name;

        await Student.updateOne(
            { socketId: socket.id },
            { $set: { name, isKicked: false } },
            { upsert: true }
        );

        const students = await Student.find({ isKicked: false });
        const participantNames = students.map(s => s.name);

        socket.emit("registration:success");
        io.emit("participants:update", participantNames);

        // Send the currently active poll to the newly registered student
        // so they don't get stuck on the waiting screen if a poll is already running
        const activePoll = await Poll.findOne().sort({ createdAt: -1 });
        if (activePoll && activePoll.startedAt) {
            const elapsed = Math.floor((Date.now() - new Date(activePoll.startedAt).getTime()) / 1000);
            const timeRemaining = Math.max(0, (activePoll.timeLimit || 60) - elapsed);
            // Only send if the poll is still active (time hasn't run out)
            if (timeRemaining > 0) {
                socket.emit("poll-started", { ...activePoll.toObject(), timeRemaining });
            }
        }
    });

    // Request Participants list
    socket.on("request-participants", async () => {
        const students = await Student.find({ isKicked: false });
        const participantNames = students.map(s => s.name);
        socket.emit("participants:update", participantNames);
    });


    // Real-time chat
    socket.on("chat:message", async ({ sender, text }) => {
        if (sender != 'Teacher') {
            const student = await Student.findOne({ name: sender });

            if (!student || student.isKicked) return;
        }

        const newMsg = await Message.create({
            sender,
            text,
            socketId: socket.id,
        });

        io.emit("chat:message", {
            sender: newMsg.sender,
            text: newMsg.text,
            createdAt: newMsg.createdAt,
        });
    });

    // To get all the messages
    socket.on("get-all-messages", async () => {
        const allMessages = await Message.find({}).sort({ createdAt: 1 });
        socket.emit("chat:messages", allMessages);
    });


    // Teacher creates poll
    socket.on("create-poll", async ({ text, options, timeLimit, sessionId }) => {
        const sid = sessionId || 'legacy';
        const totalPolls = await Poll.countDocuments({ sessionId: sid });
        const startedAt = new Date();
        const poll = await Poll.create({
            text,
            options,
            timeLimit,
            sessionId: sid,
            questionNumber: totalPolls + 1,
            startedAt,
        });
        // Emit with timeRemaining = full timeLimit since it just started
        io.emit("poll-started", { ...poll.toObject(), timeRemaining: timeLimit });
    });

    async function checkCanAskNew() {
        const activePoll = await Poll.findOne().sort({ createdAt: -1 });
        if (!activePoll) return true;

        const responses = await Response.find({ pollId: activePoll._id });
        const totalStudents = await Student.countDocuments({ isKicked: false });

        return responses.length >= totalStudents;
    }


    // Student submits answer
    socket.on("submit-answer", async ({ questionId, answer }) => {
        const student = await Student.findOne({ socketId: socket.id });
        if (!student) return;

        const poll = await Poll.findById(questionId);
        if (!poll) return;

        const option = poll.options.id(answer);
        const isCorrect = option?.isCorrect || false;

        await Response.create({
            studentId: student._id,
            pollId: questionId,
            selectedOption: answer,
            isCorrect,
        });

        const responses = await Response.find({ pollId: questionId });

        const result = { answers: {} };
        for (const opt of poll.options) {
            result.answers[opt._id] = 0;
        }

        for (const res of responses) {
            const id = res.selectedOption?.toString();
            if (id && result.answers[id] !== undefined) {
                result.answers[id] += 1;
            }
        }

        const canAskNew = await checkCanAskNew();

        io.emit("poll-results", result);
    });

    // History of the poll
    socket.on("get-poll-history", async () => {
        const polls = await Poll.find({}).sort({ createdAt: -1 }).limit(10);
        const allResults = [];

        for (const poll of polls) {
            const responses = await Response.find({ pollId: poll._id });
            const result = {};

            for (const opt of poll.options) {
                result[opt._id] = 0;
            }

            for (const res of responses) {
                const id = res.selectedOption?.toString();
                if (id && result[id] !== undefined) {
                    result[id] += 1;
                }
            }

            allResults.push({
                poll,
                results: result
            });
        }

        socket.emit("poll-history", allResults);
    });

    // Kick
    socket.on('kick-student', async ({ name }) => {
        const student = await Student.findOneAndUpdate(
            { name },
            { $set: { isKicked: true } }
        );

        if (!student) return;

        const targetSocket = [...io.sockets.sockets.values()].find(
            (s) => s.data?.name === name
        );

        if (targetSocket) {
            targetSocket.emit('kicked');
            targetSocket.disconnect();
        }

        const updatedList = await getUpdatedList();
        io.emit('participants:update', updatedList);
    });

    // Disconnect cleanup
    socket.on("disconnect", async () => {
        await Student.deleteOne({ socketId: socket.id });
        delete connectedStudents[socket.id];
        io.emit("participants:update", Object.values(connectedStudents));
    });
}
