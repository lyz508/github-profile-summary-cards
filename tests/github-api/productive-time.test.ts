import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {getProductiveTime} from '../../src/github-api/productive-time';

const mock = new MockAdapter(axios);

afterEach(() => {
    mock.reset();
});

it('requests only authored dates for productive-time calculation', async () => {
    let productiveTimeQuery = '';
    mock.onPost('https://api.github.com/graphql').reply(config => {
        const body = JSON.parse(config.data);
        if (body.query.includes('query getUserId')) {
            return [200, {data: {user: {id: 'user-id'}}}];
        }
        productiveTimeQuery = body.query;
        return [
            200,
            {
                data: {
                    user: {
                        contributionsCollection: {
                            commitContributionsByRepository: [
                                {
                                    repository: {
                                        defaultBranchRef: {
                                            target: {
                                                history: {
                                                    edges: [{node: {authoredDate: '2026-08-26T08:00:00Z'}}]
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];
    });

    const result = await getProductiveTime('lyz508', '2026-08-27T00:00:00Z', '2026-08-26T00:00:00Z', 'token');

    expect(result.productiveDate).toEqual(['2026-08-26T08:00:00Z']);
    expect(productiveTimeQuery).toContain('authoredDate');
    expect(productiveTimeQuery).not.toContain('message');
    expect(productiveTimeQuery).not.toContain('email');
    expect(productiveTimeQuery).not.toMatch(/\n\s+name\s*\n/);
});
