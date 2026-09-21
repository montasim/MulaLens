import { describe, expect, it } from 'vitest';
import { betonCompanySlug, companyNamesMatch, decodeLeetText, escapeHtml, researchSlugForBeton, slugFromCompanyUrl, trucareerCandidateSlug, trucareerCompanyId } from '../src/text';

describe('company identity helpers', () => {
  it('decodes masked company names without lowercasing them', () => {
    expect(decodeLeetText('Code>< IT Service')).toBe('Codex IT Service');
    expect(decodeLeetText('Opt!m!zely')).toBe('Optimizely');
    expect(decodeLeetText('Expre$s Le@ther Products Ltd')).toBe(
      'Express Leather Products Ltd',
    );
  });

  it('uses the company slug to decode ambiguous masks safely', () => {
    expect(decodeLeetText('Inte11ier Ltd', 'intellier-ltd')).toBe(
      'Intellier Ltd',
    );
    expect(decodeLeetText('8RAC IT', 'brac-it')).toBe('BRAC IT');
    expect(decodeLeetText('10 Minute School', '10-minute-school')).toBe(
      '10 Minute School',
    );
  });

  it('extracts only company slugs', () => {
    expect(
      slugFromCompanyUrl('https://deshimula.com/companies/technonext-ltd'),
    ).toBe('technonext-ltd');
    expect(slugFromCompanyUrl('https://deshimula.com/story/123')).toBeNull();
    expect(slugFromCompanyUrl('https://example.com/companies/technonext-ltd')).toBeNull();
  });

  it('escapes untrusted markup', () => {
    expect(escapeHtml('<img onerror="x">')).toBe(
      '&lt;img onerror=&quot;x&quot;&gt;',
    );
  });

  it('recognizes Beton Kemon company profiles in both languages', () => {
    expect(betonCompanySlug('https://www.betonkemon.com/en/c/brain-station-23')).toBe('brain-station-23');
    expect(betonCompanySlug('https://betonkemon.com/bn/c/technonext')).toBe('technonext');
    expect(betonCompanySlug('https://www.betonkemon.com/en')).toBeNull();
    expect(betonCompanySlug('https://example.com/en/c/brain-station-23')).toBeNull();
  });

  it('maps only verified differing Beton Kemon identifiers', () => {
    expect(researchSlugForBeton('technonext')).toBe('technonext-ltd');
    expect(researchSlugForBeton('brac-it-services-limited')).toBe('brac-it');
    expect(researchSlugForBeton('brain-station-23')).toBe('brain-station-23');
  });

  it('uses TruCareer profile IDs only as page identity', () => {
    expect(trucareerCompanyId('https://trucareer.co/company/b315831a-4e42-4fbb-82dd-319356598d71?tab=salaries')).toBe('b315831a-4e42-4fbb-82dd-319356598d71');
    expect(trucareerCompanyId('https://trucareer.co/company/b315831a-4e42-4fbb-82dd-319356598d71/role/123')).toBeNull();
    expect(trucareerCompanyId('https://example.com/company/b315831a-4e42-4fbb-82dd-319356598d71')).toBeNull();
  });

  it('derives candidates from visible names but requires an exact company match', () => {
    expect(trucareerCandidateSlug('Brain Station 23')).toBe('brain-station-23');
    expect(trucareerCandidateSlug('bKash')).toBe('bkash');
    expect(companyNamesMatch('Brain Station 23', 'brain station 23')).toBe(true);
    expect(companyNamesMatch('Vivasoft Limited', 'Vivasoft')).toBe(false);
  });
});
