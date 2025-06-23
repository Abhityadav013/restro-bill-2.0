const { searchCommands } = require("../order-list-search-command");

const getConditions = async (searchPhrases, search) => {
  let searchConditions = {};
  if (searchPhrases.length) {
    searchConditions = { $and: [] };
  }

  if (search) {
    const searchValues = { $or: [] };

    for (const phrase of searchPhrases) {
      const [command, value] = phrase.split(":").map((p) => p.trim());

      if (value && searchCommands[command]) {
        const filters = await getFilters(command, value);

        if (filters) {
          searchConditions["$and"].push(filters);
        }
      }
    }

    if (searchValues["$or"].length) searchConditions["$and"].push(searchValues);
  }

  return searchConditions;
};

const getFilters = async (command, value) => {
  const searchCommand = searchCommands[command];
  if (!searchCommand) {
    return null;
  }
  const filterName = searchCommand.filterName;
  if (!filterName) {
    return null;
  }

  const condition = searchCommand.conditions
    ? searchCommand.conditions(value)
    : value;

  return { [filterName]: condition };
};

module.exports = { getConditions };
