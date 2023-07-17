Prism.languages.rql = {
	'comment': {
		pattern: /(\/\/.*|#.*)/,
		greedy: true
	},
	'string': {
		pattern: /```[\s\S]*?```|[hH]?(?:"(?:[^\r\n\\"]|\\.)*"|'(?:[^\r\n\\']|\\.)*'|@(?:"[^\r\n"]*"|'[^\r\n']*'))/,
		greedy: true
	},

	'class-name': /\b(?:[Ii]n|eq|EQ|Eq|[Rr]eg[Ee]xp|RE|re|[Ee]xpand|[Ee]xists|[Cc]ontains|(?:[Ss]tarts|[Ee]nds)[Ww]ith|not|Not|NOT|ContainsCIS|containscis|GT|gt|Gt|LT|lt|Lt|LTE|lte|Lte|Gte|GTE|gte|intel|IntelLookup|threat|ThreatList|threatlist|threat_lookup|intel_lookup|intellookup|incidr|InCIDR|InCidr)\b/,
	'keyword': /\b(?:and|or|AND|OR)/,
	'boolean': /\b(?:true|false|null)\b/,

	'function': /\b(?:\|length|count|lowercase|uppercase|refang|b64decode|b64extract|urldecode|any|all|avg|max|min|sum|split)\b/,

	'datetime': [
		{
			// RFC 822 + RFC 850
			pattern: /\b(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*,\s*)?\d{1,2}(?:\s+|-)(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+|-)\d{2}\s+\d{2}:\d{2}(?::\d{2})?(?:\s*(?:\b(?:(?:U|GM|[ECMT][DS])T|[A-Z])|[+-]\d{4}))?\b/,
			alias: 'number'
		},
		{
			// ISO 8601
			pattern: /[+-]?\b(?:\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?|\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)Z?/,
			alias: 'number'
		}
	],
	'number': /\b(?:0x[0-9A-Fa-f]+|\d+(?:\.\d+)?(?:[Ee][+-]?\d+)?)(?:(?:min|sec|[mnµ]s|tick|microsecond|[dhms])\b)?|[+-]?\binf\b/,

	'operator': /=>|[!=]~|[!=<>]=?|[-+*/%|]|\.\./,
	

	'verb': {
		pattern: /.*(\|\s*)[a-z][\w-]*/i,
		lookbehind: true,
		alias: 'constant'
	},
    
	'constant': {
		pattern: /(?:observables|value|tlp|tags|spotted|safe|source_field|data_type|ioc|original_source_field|title|organization|description|tlp|severity|risk_score|status|name|reference|source|signature|tags|raw_log[\.]?.*)/
	},

	'command': {
		pattern: /\.[a-z][a-z\d-]*\b/,
		alias: 'keyword'
	},

	'punctuation': /[()\[\]{},;.:]/,
};
