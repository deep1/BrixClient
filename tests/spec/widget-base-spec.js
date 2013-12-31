// sample test for widget-base
'use strict';
(function () {
    var expect = chai.expect;

	var logFormat = pearson.brix.utils.logFormat;
	var sign = pearson.brix.utils.sign;

    describe('Utility functions should be awesome', function () {
        describe('logFormat should do logFormatting', function () {
            it('should produce negative decade tick label -2 from 10^2', function () {
                expect(logFormat(Math.pow(10, -2))).to.equal(-2);
            });
            it('should produce no tick label from 2*10-3', function () {
                expect(logFormat(2 * Math.pow(10, -3))).to.equal('');
            });
            it('should produce no odd decade tick label from 10^3', function () {
                expect(logFormat(Math.pow(10, -3))).to.equal('');
            });
        });
		
		describe('sign function determines sign of a number', function () {
            it('should return -1 for negative numbers', function () {
                expect(sign(-42)).to.equal(-1);
            });
            it('should return 1 for positive numbers', function () {
                expect(sign(4.5)).to.equal(1);
            });
			it('should return 0 for zero', function() {
				// I'm not sure this is what I'd want, I think I'd want 0 to return 1. -mjl
				// because to give y the same sign as x I would want to write: y = sign(x) * abs(y);
				// so it is useful to consider 0 positive even though it isn't.
                expect(sign(0)).to.equal(0);
			});
			it.skip('should return the same value as the number the string converts to for strings which convert to a number', function () {
                expect(sign("12.45")).to.equal(1);
                expect(sign("0.00")).to.equal(0);
                expect(sign("-123")).to.equal(-1);
			});
            it('should return 1 for strings that can\'t convert to a number', function () {
                expect(sign("foo")).to.equal(1);
            });
			it('should return 0 for any argument which is "falsy" (NaN, "", null, undefined)', function () {
                expect(sign(NaN)).to.equal(0);
                expect(sign("")).to.equal(0);
                expect(sign(null)).to.equal(0);
                expect(sign(undefined)).to.equal(0);
            });
        });
    });
	
	
})();
