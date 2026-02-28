import React from "react";

const PollQuestion = ({
    question,
    selectedOption,
    setSelectedOption,
    handleSubmit,
    timer,
    submitted,
    result,
}) => {
    const timeLimit = question?.timeLimit || 60;
    const timePercentage = (timer / timeLimit) * 100;

    // Find if the student's selected option was correct
    const selectedOpt = question?.options?.find(opt => opt._id === selectedOption);
    const answeredCorrectly = submitted && selectedOpt?.isCorrect === true;
    const answeredWrong = submitted && selectedOption && selectedOpt?.isCorrect === false;

    return (
        <div className="m-auto max-w-6xl w-full bg-white px-4">
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-black">Question</h2>
                    <span className="text-sm font-semibold text-red-500">
                        ⏱ {timer < 10 ? `0${timer}` : timer}
                    </span>
                </div>

                {/* Question Box */}
                <div className="rounded-t-md bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 font-medium">
                    {question.text}
                </div>

                {/* Options */}
                <div className="border border-purple-300 border-t-0 rounded-b-md p-4 space-y-3">
                    {question.options.map((opt, index) => {
                        const isSelected = selectedOption === opt._id;
                        const votes = result?.answers?.[opt._id] || 0;

                        const totalVotes = Object.values(result?.answers || {}).reduce(
                            (acc, count) => acc + count,
                            0
                        );

                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                        // Determine option color after submission
                        let optionClass = "hover:bg-gray-50 border";
                        if (submitted) {
                            if (opt.isCorrect) {
                                optionClass = "border-2 border-green-500 bg-green-50"; // correct answer always shown green
                            } else if (isSelected && !opt.isCorrect) {
                                optionClass = "border-2 border-red-400 bg-red-50"; // student's wrong choice shown red
                            } else {
                                optionClass = "bg-gray-100";
                            }
                        } else if (isSelected) {
                            optionClass = "border-2 border-purple-500 bg-purple-50";
                        }

                        return (
                            <label
                                key={opt._id}
                                className={`flex items-center justify-between px-4 py-2 rounded-md transition-all text-left relative ${optionClass}`}
                            >
                                <div className="flex items-center space-x-3 z-10">
                                    <span
                                        className={`w-6 h-6 flex items-center justify-center text-sm rounded-full border font-bold
                        ${submitted
                                                ? opt.isCorrect
                                                    ? "bg-green-500 text-white border-green-500"
                                                    : isSelected
                                                        ? "bg-red-400 text-white border-red-400"
                                                        : "bg-primary text-white"
                                                : "border-gray-400 text-gray-700"}`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-black">{opt.text}</span>
                                    {submitted && opt.isCorrect && (
                                        <span className="text-green-600 text-xs font-semibold ml-1">✓ Correct</span>
                                    )}
                                </div>

                                {submitted && (
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-md opacity-20 z-0 ${opt.isCorrect ? "bg-green-500" : "bg-primary"}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                )}

                                {submitted && (
                                    <span className="z-10 font-semibold text-sm text-black">{percentage}%</span>
                                )}

                                <input
                                    type="radio"
                                    name="poll"
                                    value={opt._id}
                                    checked={isSelected}
                                    onChange={() => setSelectedOption(opt._id)}
                                    className="hidden"
                                />
                            </label>
                        );
                    })}

                </div>

                {/* Submit Button */}
                {!submitted && (
                    <div className="flex justify-center mt-5">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className="bg-primary text-white font-medium px-6 py-2 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                )}

                {/* After Submit Feedback */}
                {submitted && (
                    <div className="mt-4 text-center">
                        {answeredCorrectly && (
                            <p className="text-green-600 font-bold text-lg">🎉 Correct! Well done!</p>
                        )}
                        {answeredWrong && (
                            <p className="text-red-500 font-bold text-lg">❌ Incorrect. Check the correct answer above.</p>
                        )}
                        {!selectedOption && (
                            <p className="text-gray-500 font-medium">You did not answer this question.</p>
                        )}
                        <p className="text-primary font-medium mt-1">
                            Wait for the teacher to ask a new question...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollQuestion;
