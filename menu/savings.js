const { getUser } = require("../controllers/users");

module.exports = (menu) => {
  // Define menu states
  menu.state("dashboard.savings", {
    run: async () => {
      // use menu.con() to send response without terminating session

      const { phoneNumber } = menu.args;
      const user = await getUser(phoneNumber);

      menu.con(`Your savings are: ${user.amount} \n0. Dashboard`);
    },
    // next object links to next state based on user input
    next: {
      0: "dashboard",
    },
  });

  return menu;
};
