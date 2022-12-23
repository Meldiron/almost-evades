export const CollideUtils = {
	circleWithBox: (
		a: {
			x: number;
			y: number;
			radius: number;
		},
		b: {
			x: number;
			y: number;
			width: number;
			height: number;
		}
	) => {
		const res = CollideUtils.boxWithBox({
			x: a.x - a.radius,
			y: a.y - a.radius,
			width: a.radius * 2,
			height: a.radius * 2
		}, b);

		return {
			...res,
			x: res.x + a.radius,
			y: res.y +  a.radius
		}
	},
	boxWithBox: (
		aTyped: {
			x: number;
			y: number;
			width: number;
			height: number;
		},
		bTyped: {
			x: number;
			y: number;
			width: number;
			height: number;
		}
	) => {
		const a: any = aTyped;
		const b: any = bTyped;

		const res: any = {
			x: a.x,
			y: a.y,
			xState: 'none',
			yState: 'none',
			xForce: 0,
			yForce: 0
		}

		function collideAlgo(axis: string, dimension: string, opposideAxis: string, opposideDimension: string) {
			const collideRes = {...res};

			if(a[opposideAxis] + a[opposideDimension] < b[opposideAxis]) {
				collideRes[`${axis}State`] = 'outside-before';
			} else if(a[opposideAxis] > b[opposideAxis] + b[opposideDimension]) {
				collideRes[`${axis}State`] = 'outside-after';
			} else if(a[axis] > b[axis] + b[dimension]) {
				collideRes[`${axis}State`] = 'after';
			} else if(a[axis] + a[dimension] < b[axis]) {
				collideRes[`${axis}State`] = 'before';
			} else {
				if(a[axis] + a[dimension] < b[axis] + (b[dimension]/2)) {
					collideRes[`${axis}State`] = 'collide-before';
					collideRes[`${axis}Force`] = a[axis] + a[dimension] - b[axis];
					collideRes[axis] = b[axis] - a[dimension];
				} else {
					collideRes[`${axis}State`] = 'collide-after';
					collideRes[`${axis}Force`] = b[axis] + b[dimension] - a[axis];
					collideRes[axis] = b[axis] + b[dimension];
				}
			}

			return collideRes;
		}

		const resX = collideAlgo('x', 'width', 'y', 'height');
		const resY = collideAlgo('y', 'height', 'x', 'width');

		const finalRes = resX.xForce < resY.yForce ? resX : resY;

		return {
			...finalRes,
			collide: finalRes.xState.startsWith('collide') || finalRes.yState.startsWith('collide')
		};
	},
	circleWithCircle: (
		a: {
			x: number;
			y: number;
			radius: number;
		},
		b: {
			x: number;
			y: number;
			radius: number;
		}
	) => {
		// TODO: Implement properly

		const res = CollideUtils.boxWithBox({
			x: a.x - a.radius,
			y: a.y - a.radius,
			width: a.radius * 2,
			height: a.radius * 2
		}, {
			x: a.x - a.radius,
			y: a.y - a.radius,
			width: a.radius * 2,
			height: a.radius * 2
		});

		return {
			...res,
			x: res.x + a.radius,
			y: res.y +  a.radius
		}
	}
};
