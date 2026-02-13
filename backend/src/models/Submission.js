/**
 * Submission Model
 * Mongoose schema for form submissions
 */

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    order: {
      type: String,
      required: [true, 'Order details are required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    unit: {
      type: String,
      default: 'tonne',
    },
    rego: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
      uppercase: true,
    },
    signature: {
      type: String, // Base64 encoded image
      required: false,
    },
    ticketImage: { // New field for ticket photo
      type: String, // Base64 encoded image
      required: false,
    },
    docketNumber: {
      type: String,
      sparse: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
submissionSchema.index({ customer: 1 });
submissionSchema.index({ date: -1 });

submissionSchema.index({ createdAt: -1 });
// Note: docketNumber index is already created by sparse: true in schema

// Compound index for filtering
submissionSchema.index({ customer: 1, date: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
