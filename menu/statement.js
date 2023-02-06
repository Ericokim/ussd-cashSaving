module.exports = (menu) => {
  // Define menu states
  menu.state("dashboard.statement", {
    run: async () => {
      menu.end(
        `Sorry, this service is unavailable at the moment. Please try again later.`
      );
    },
  });

  return menu;
};
