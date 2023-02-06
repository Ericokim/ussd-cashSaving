const _ = require("lodash");
const { createUser } = require("../controllers/users");
const { session } = require("../utils/sessionHandler");

module.exports = (menu) => {
  // Define menu states

  menu.state("register", {
    run: () => {
      menu.con("Enter your Name");
    },
    // using regex to match user input to next state
    next: {
      "*[a-zA-Z]+": "register.amount",
    },
  });

  menu.state("register.amount", {
    run: async () => {
      const { val } = menu;
      session["name"] = val;

      menu.con("Enter amount");
    },

    // using regex to match user input to next state
    next: {
      "*\\d+": "register.pin",
    },
  });

  menu.state("register.pin", {
    run: async () => {
      const { val } = menu;
      session["amount"] = val;

      menu.con("Enter your pin");
    },

    // using regex to match user input to next state
    next: {
      "*\\d+": "end",
    },
  });

  menu.state("end", {
    run: async () => {
      const {
        val,
        args: { phoneNumber },
      } = menu;
      session["pin"] = val;

      // Save the data to Mongo
      await createUser({
        Name: session.name,
        phone: phoneNumber,
        amount: session.amount,
        pin: session.pin,
      }).then((res) => {
        if (res) {
          menu.end(
            "Awesome! \n Account created. Sending a confirmation text shortly."
          );
        } else {
          menu.end("Error!!");
        }
      });
    },
  });

  return menu;
};
