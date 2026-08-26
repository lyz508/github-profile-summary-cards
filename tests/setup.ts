import * as core from '@actions/core';

jest.spyOn(core, 'warning').mockImplementation(() => {});
