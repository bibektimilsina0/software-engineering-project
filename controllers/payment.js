const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const Campaign = require('../models/campaign');

const onSuccess = async (req, res) => {
  try {
    console.log(req.user);
    const campaignID = req.params.id;
    const amt = parseInt(req.body.amt);

    const campaign = await Campaign.findOneAndUpdate(
      { _id: campaignID },
      {
        $inc: { fundsRaised: amt, fundsNeeded: -amt } // Increment fundRaised and decrement fundNeeded
      },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      throw new NotFoundError(`No campaign with id ${campaignID}`);
    }

    res.status(StatusCodes.OK).json({ campaign });
  } catch (error) {
    // Handle errors
    console.error('Error updating campaign:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An error occurred' });
  }
};

const getpayment = async (req, res) => {
  res.send('getpayment');
};

module.exports = { getpayment, onSuccess };
