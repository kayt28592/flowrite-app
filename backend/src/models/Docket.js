/**
 * Docket Model
 * Mongoose schema for generated dockets
 */

const mongoose = require('mongoose');

const docketSchema = new mongoose.Schema(
  {
    docketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    customerInfo: {
      email: String,
      phone: String,
      address: String,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    submissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    }],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'final', 'sent', 'paid'],
      default: 'final',
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: docketNumber index is automatically created by unique: true
docketSchema.index({ customer: 1 });
docketSchema.index({ status: 1 });
docketSchema.index({ createdAt: -1 });

// Auto-generate docket number before validation
docketSchema.pre('validate', async function (next) {
  if (!this.docketNumber) {
    // Find last docket matching FRG-
    const lastDocket = await this.constructor
      .findOne({ docketNumber: new RegExp('^FRG-') })
      .sort({ docketNumber: -1 });

    let sequence = 1;
    if (lastDocket) {
      const parts = lastDocket.docketNumber.split('-');
      const lastSequence = parseInt(parts[1]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    this.docketNumber = `FRG-${String(sequence).padStart(3, '0')}`;
  }
  next();
});

const Docket = mongoose.model('Docket', docketSchema);

module.exports = Docket;
