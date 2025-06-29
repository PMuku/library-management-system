// utils/calculateFine.js

const calculateAndUpdateFine = async (issueRequest) => {
  const now = new Date();
  const dueDate = new Date(issueRequest.issueDate);
  dueDate.setDate(dueDate.getDate() + issueRequest.duration);

  if (now > dueDate) {
    const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    const newFine = daysLate * issueRequest.finePerDay;
    if (!issueRequest.finePaid) {
        issueRequest.fineAmount = newFine;
        issueRequest.finePaid = false;
        await issueRequest.save();
    } else if (issueRequest.fineAmount !== newFine) {
        request.fineAmount = newFine;
        await request.save();
    }
  } else {
    if (issueRequest.fineAmount !== 0 && !issueRequest.finePaid) {
      issueRequest.fineAmount = 0;
      issueRequest.finePaid = true; 
      await issueRequest.save();
    }
  }

  return issueRequest;
};

export default calculateAndUpdateFine;
