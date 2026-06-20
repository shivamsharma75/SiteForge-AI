import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    website: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Website",
        required: true
    },
    formName: {
        type: String,
        default: "Contact Form"
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
