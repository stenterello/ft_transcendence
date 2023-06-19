export enum	settings {
	twoFactorManagement,
	changeAvatar,
	changeUsername,
	changePassword,
	other
}

export function	setSetting(s1: settings, s: settings): any {
	s1 = s;
}

export function	getParams(url: string): Object {

	let params: Object = {};

	new URL(url).searchParams.forEach(function (val, key) {
		if (params[key] !== undefined) {
			if (!Array.isArray(params[key])) {
				params[key] = [params[key]];
			}
			params[key].push(val);
		} else {
			params[key] = val;
		}
	});

	return params;
}
