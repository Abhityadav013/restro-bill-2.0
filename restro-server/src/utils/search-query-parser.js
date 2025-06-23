function searchQueryParser(searchQuery, searchCommands) {
  if (!searchQuery) return [];

  // Escape special characters for regex and replace : spacing issue
  const searchTerm = escapeRegExp(searchQuery).replace(/(\s*:\s*)/g, ':');

  // This regex will match the `dateRange: <startDate> TO <endDate>` and group them as one token
  const dateRangePattern = /dateRange:\s*([\d-]+)\s*TO\s*([\d-]+)/i;

  const searchTokens = [];

  // We need to split the query by AND or OR but also keep date ranges together
  const parts = searchTerm.split(/\s+(AND|OR)\s+/i);

  // Iterate through the parts and check for dateRange
  parts.forEach((phrase) => {
    // If it's a dateRange with TO, we don't want to split it further
    if (dateRangePattern.test(phrase)) {
      searchTokens.push(phrase); // Push the dateRange as it is
    } else {
      // Otherwise, just add the part as-is
      searchTokens.push(phrase.trim().replace(/"+/g, ''));
    }
  });

  return searchTokens ?? [];
}

function searchQueryIngnoringSpacesParser(searchQuery, searchCommands) {
  if (!searchQuery) return [];
  const searchTerm = escapeRegExp(searchQuery).replace(/(\s*:\s*)/g, ":");
  const searchTokens = searchTerm.split(/(?!\B"[^"]*)\bAND\b(?![^"]*"\B)/gi);

  return searchTokens?.map((phrase) => phrase.trim().replace(/"+/g, "")) ?? [];
}

function escapeRegExp(str) {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
}

module.exports = { searchQueryParser, searchQueryIngnoringSpacesParser };
