const dotenv = require("dotenv");
const _ = require("lodash");
const { getUser } = require("../controllers/users");

const dashboard = require("./dashboard");
const register = require("./register");

// Load env vars
dotenv.config();

module.exports = (menu) => {
  // Define menu states
  menu.startState({
    run: async () => {
      // use menu.con() to send response without terminating session

      const { phoneNumber } = menu.args;
      const user = await getUser(phoneNumber);

      if (user) {
        menu.con(
          `Welcome back ${user.Name} to Cash savings:` +
            "\nEnter your 4-digit PIN to continue:"
        );
      } else {
        menu.con("Welcome to Cash savings:" + "\n1. Get started" + "\n0. Exit");
      }
    },
    // next object links to next state based on user input
    next: {
      "*\\d{4}": "dashboard",
      1: "register",
      0: "Exit",
    },

    defaultNext: "invalidOption",
  });

  menu.state("Exit", {
    run: () => {
      menu.end("Goodbye :)");
    },
  });

  menu.state("invalidOption", {
    run: () => {
      menu.end(`Invalid option`);
    },
  });

  menu.state("IncorrectInput", {
    run: () => {
      menu.end(`Incorrect input`);
    },
  });

  _.over([dashboard, register])(menu);

  return menu;
};
