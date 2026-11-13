const DOMAIN_CONFIGS = {
  dev: [
  ],
  stage: [
  ],
  'pre-prod': [
  ],
  prod: [
    {
      domain: 'gigsberg.ch',
      environment: 'prod',
      protocol: 'https',
      isProduction: true,
    },
    {
      domain: 'gigsberg.co.uk',
      environment: 'prod',
      protocol: 'https',
      isProduction: true,
    },
    {
      domain: 'gigsberg.com',
      environment: 'prod',
      protocol: 'https',
      isProduction: true,
    },
    {
      domain: 'tickets.marca.com',
      environment: 'prod',
      protocol: 'https',
      isProduction: true,
    },
    {
      domain: 'entradas.marca.com',
      environment: 'prod',
      protocol: 'https',
      isProduction: true,
    },
  ],
};

const getDomainsForEnvironment = (environment) => {
  return DOMAIN_CONFIGS[environment] || [];
};

const getAllDomains = () => {
  return Object.values(DOMAIN_CONFIGS).flat();
};

module.exports = {
  getDomainsForEnvironment,
  getAllDomains,
};
