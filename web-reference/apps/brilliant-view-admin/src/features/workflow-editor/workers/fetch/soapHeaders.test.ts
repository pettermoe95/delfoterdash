import { expect, it } from 'vitest';
import { syncSoapHeaders } from './soapHeaders';

it('replaces Content-Type case-insensitively when switching versions and preserves other headers', () => {
    const previous = { soapVersion: '1.1' };
    const next = {
        soapVersion: '1.2',
        headers: {
            'content-type': 'custom',
            'CONTENT-TYPE': 'duplicate',
            Accept: 'text/xml',
        },
    };
    const updated = syncSoapHeaders(next, previous);
    expect(updated.headers).toEqual({
        Accept: 'text/xml',
        'Content-Type': 'application/soap+xml; charset=utf-8',
    });
    expect(next.headers['content-type']).toBe('custom');
    expect(
        syncSoapHeaders({ ...updated, soapVersion: '1.1' }, updated).headers
    ).toEqual({
        Accept: 'text/xml',
        'Content-Type': 'text/xml; charset=utf-8',
    });
});

it('keeps SOAP 1.2 action parameters in generated headers while allowing manual header edits', () => {
    const initial = syncSoapHeaders({
        soapVersion: '1.2',
        soapAction: 'urn:fetch',
    });
    expect(initial.headers).toEqual({
        'Content-Type':
            'application/soap+xml; charset=utf-8; action="urn:fetch"',
    });
    const changed = syncSoapHeaders(
        { ...initial, soapAction: 'urn:next' },
        initial
    );
    expect(changed.headers).toEqual({
        'Content-Type':
            'application/soap+xml; charset=utf-8; action="urn:next"',
    });
    const custom = {
        ...changed,
        headers: { 'Content-Type': 'application/custom+xml' },
    };
    expect(syncSoapHeaders(custom, changed)).toBe(custom);
    const unrelated = { ...custom, url: 'https://example.com' };
    expect(syncSoapHeaders(unrelated, custom)).toBe(unrelated);
    expect(
        syncSoapHeaders({ ...changed, soapAction: undefined }, changed).headers
    ).toEqual({
        'Content-Type': 'application/soap+xml; charset=utf-8',
    });
});
