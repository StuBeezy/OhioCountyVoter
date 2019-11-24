import { isEmpty, isUndefined, each } from 'lodash';

var columnNames = {
  party: 'PARTY_AFFILIATION',
  zip: 'RESIDENTIAL_ZIP'
};
var partyAffliations = {
  C: 'Constitution Party',
  D: 'Democrat Party',
  E: 'Reform Party',
  G: 'Green Party',
  L: 'Libertarian Party',
  N: 'Natural Law Party',
  R: 'Republican Party',
  S: 'Socialist Party'
};

const determineChartData = (chartChoice, options, zipCodes) => {
  const chartFunc = chartChoices[chartChoice];
  return chartFunc(options, zipCodes, chartChoice);
};

const generateDefaultOptions = () => {
  return {
    animationEnabled: true,
    title: {
      text: 'Default Chart Title'
    },
    data: [{
      type: 'bar',
      dataPoints: []
    }]
  };
};


const getPartyAffiliations = (data) => {
  const newData = {};
  let updatedChartOptions = generateDefaultOptions();
  let dataPoints = [];

  data.forEach(function(voter) {
    let partyAffliation = voter[columnNames.party];
    if (isEmpty(partyAffliation)) {
      !isUndefined(newData['Unregistered']) ? newData['Unregistered'].value += 1 : newData['Unregistered'] = { value: 1, name: 'Unregisted'}
    } else {
      !isUndefined(newData[partyAffliations[partyAffliation]]) ?
        newData[partyAffliations[partyAffliation]].value += 1 :
        newData[partyAffliations[partyAffliation]] = { value: 1, name: partyAffliations[partyAffliation] };
    }
  });

  each(newData, (value, key) => {
    dataPoints.push({
      y: value.value,
      label: key,
      percent: ((value.value / data.length) * 100).toFixed(2)
    });
  });

  updatedChartOptions = {
    ...updatedChartOptions,
    title: {
      text: 'Party Affiliations for County'
    },
    data: [{
      type: 'pie',
      startAngle: 65,
      indexLabelFontSize: 16,
      toolTipContent: "<b>{label}</b>: {percent}%",
      showInLegend: "true",
      legendText: "{label}",
      indexLabel: "{label} - {percent}%",
      dataPoints
    }]
  };


  return updatedChartOptions;
};

const findZipCodes = (data, zipCodes, chartChoice) => {
  const newData = {};
  let updatedChartOptions = generateDefaultOptions();
  let dataPoints = [];
  let voterCount = 0;
  const partyChoices = {
    'Rep_zip': {
      text: 'Republican',
      partyType: 'R'
    },
    'Dem_zip': {
      text: 'Democrats',
      partyType: 'D'
    },
    'Unreg_zip': {
      text: 'Unregistered',
      partyType: ''
    }
  };

  each(data, (voter) => {
    let partyAffliation = voter[columnNames.party];
    if (partyAffliation === partyChoices[chartChoice].partyType) {
      voterCount += 1;
      let city = zipCodes[voter[columnNames.zip]].city;
      !isUndefined(newData[city]) ? newData[city].value += 1 :
        newData[city] = { value: 1, name: city };
    }
  });

  each(newData, (value, key) => {
    dataPoints.push({
      y: value.value,
      label: key,
      percent: ((value.value / voterCount) * 100).toFixed(2)
    });
  });

  updatedChartOptions = {
    ...updatedChartOptions,
    title: {
      text: partyChoices[chartChoice].text + ' Percentages based on city'
    },
    data: [{
      type: 'pie',
      startAngle: 65,
      indexLabelFontSize: 16,
      toolTipContent: "<b>{label}</b>: {percent}%",
      showInLegend: "true",
      legendText: "{label}",
      indexLabel: "{label} - {percent}%",
      dataPoints
    }]
  };

  return updatedChartOptions
};

var chartChoices = {
  'Pop': getPartyAffiliations,
  'Rep_zip': findZipCodes,
  'Dem_zip': findZipCodes,
  'Unreg_zip': findZipCodes
};

export { getPartyAffiliations, findZipCodes, columnNames, determineChartData };
