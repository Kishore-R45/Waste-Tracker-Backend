const generateSuggestions = (wasteData) => {
  const suggestions = [];
  
  // Analyze waste patterns
  const { plastic, organic, paper, glass } = wasteData;
  
  // Plastic suggestions
  if (plastic > 2) {
    suggestions.push({
      category: 'plastic',
      priority: 1,
      text: 'Switch to reusable shopping bags and water bottles',
      impact: 'high'
    });
  }
  
  // Organic suggestions
  if (organic > 5) {
    suggestions.push({
      category: 'organic',
      priority: 1,
      text: 'Start composting to turn waste into garden nutrients',
      impact: 'medium'
    });
  }
  
  // Paper suggestions
  if (paper > 3) {
    suggestions.push({
      category: 'paper',
      priority: 2,
      text: 'Use digital documents and double-sided printing',
      impact: 'medium'
    });
  }
  
  // Glass suggestions
  if (glass > 2) {
    suggestions.push({
      category: 'glass',
      priority: 2,
      text: 'Reuse glass jars for storage and buy in bulk',
      impact: 'low'
    });
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
};

module.exports = { generateSuggestions };