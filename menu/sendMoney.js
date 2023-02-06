const { getUser, updateBalance } = require("../controllers/users");
const { session } = require("../utils/sessionHandler");

module.exports = (menu) => {
  // Define menu states
  menu.state("dashboard.sendMoney", {
    run: async () => {
      const { val } = menu;
      menu.con(`Enter amount to send`);
    },
    // next object links to next state based on user input
    next: {
      "*\\d": "dashboard.sendMoney.receiver",
    },
    defaultNext: "IncorrectInput",
  });

  menu.state("dashboard.sendMoney.receiver", {
    run: async () => {
      const {
        val,
        args: { phoneNumber },
      } = menu;
      session["amount"] = val;
      const user = await getUser(phoneNumber);
      const enteredAmount = JSON.parse(val);

      console.log(enteredAmount, user.amount);

      if (val > user.amount) {
        menu.end("Sorry, you don't have sufficient amount to send!");
      } else {
        menu.con(`Enter phone number to send to`);
      }
    },
    // next object links to next state based on user input
    next: {
      "*\\d{10}": "dashboard.sendMoney.send",
    },
    defaultNext: "IncorrectInput",
  });

  menu.state("dashboard.sendMoney.send", {
    run: async () => {
      const {
        val,
        args: { phoneNumber },
      } = menu;

      const sender = await getUser(phoneNumber);
      const reciever = await getUser(val);

      if (reciever) {
        const amountToSend = session.amount;
        const balance = sender.amount - amountToSend;

        const senderPhone = phoneNumber;
        const receiverPhone = reciever.phone;
        await updateBalance(balance, senderPhone);
        await updateBalance(amountToSend + reciever.amount, receiverPhone);

        menu.end(
          `You have successfully sent Ksh ${amountToSend} to ${reciever.firstName} ${reciever.lastName} (${reciever.phone}). Your new balance is Ksh ${balance}`
        );
      } else {
        menu.end("Invalid receipient");
      }
    },
    // next object links to next state based on user input
    next: {
      "*\\d{10}": "dashboard.sendMoney.send",
    },
  });

  return menu;
};
