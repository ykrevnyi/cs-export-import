import Container from 'lumenode-container';

const ioc = new Container;

global.app = () => {
  return ioc;
};
