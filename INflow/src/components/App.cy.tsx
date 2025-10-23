import MenuLayouts from '../views/MenuLayouts';

describe('<MenuLayouts />', () => {
  it('mounts', () => {
    cy.mount(<MenuLayouts indexLayout={0} setIsRunningLayout={() => {}} />);
  });
});
