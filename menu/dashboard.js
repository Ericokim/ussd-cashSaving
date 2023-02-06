const _ = require("lodash");
const { login } = require("../controllers/users");
const { session } = require("../utils/sessionHandler");

const savings = require("./savings");
const sendMoney = require("./sendMoney");
const settings = require("./settings");
const statement = require("./statement");

module.exports = (menu) => {
  // Define menu states

  menu.state("dashboard", {
    run: async () => {
      const {
        val,
        args: { phoneNumber },
      } = menu;
      session["newPin"] = val;

      if (session.newPin) {
        // Save the data to Mongo
        await login(session.newPin, phoneNumber).then((res) => {
          if (res) {
            menu.con(
              `Choose a service to proceed:` +
                "\n1. Send Money" +
                "\n2. Check savings" +
                "\n3. View Mini-statement" +
                "\n4. Change PIN" +
                "\n0. Exit"
            );
          } else {
            menu.go("dashboard.WrongPin");
          }
        });
      } else {
        menu.end(`invalid`);
      }
    },
    // next object links to next state based on user input
    next: {
      1: "dashboard.sendMoney",
      2: "dashboard.savings",
      3: "dashboard.statement",
      4: "dashboard.settings",
      0: "Exit",
    },

    defaultNext: "invalidOption",
  });

  menu.state("dashboard.WrongPin", {
    run: () => {
      menu.con(`Wrong Pin:` + "\nEnter the Correct PIN to continue:");
    },

    // using regex to match user input to next state
    next: {
      "*\\d+": "dashboard.CorrectPin",
    },
  });

  menu.state("dashboard.CorrectPin", {
    run: async () => {
      const {
        val,
        args: { phoneNumber },
      } = menu;

      if (val) {
        // Save the data to Mongo
        await login(val, phoneNumber).then((res) => {
          if (res) {
            menu.con(
              `Choose a service to proceed:` +
                "\n1. Send Money" +
                "\n2. Check savings" +
                "\n3. View Mini-statement" +
                "\n4. Change PIN" +
                "\n0. Exit"
            );
          } else {
            menu.end("Wrong Pin");
          }
        });
      } else {
        menu.end(`invalid`);
      }
    },
    // next object links to next state based on user input
    next: {
      1: "dashboard.sendMoney",
      2: "dashboard.savings",
      3: "dashboard.statement",
      4: "dashboard.settings",
      0: "Exit",
    },
    defaultNext: "invalidOption",
  });

  _.over([savings, sendMoney, statement, settings])(menu);

  return menu;
};
