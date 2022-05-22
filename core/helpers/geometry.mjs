export function all_points_in_circle(xCenter, yCenter, radius) {
    let points_in_circle = [];

    for (let x = xCenter - radius ; x <= xCenter; x++) {
        for (let y = yCenter - radius ; y <= yCenter; y++) {
            // Since this is a circle, we can speed this up 4x (and avoid sqrt) by taking symmetric
            // points from a single quadrant.
            if ((x - xCenter) * (x - xCenter) + (y - yCenter) * (y - yCenter) <= r * r) {
                xSym = xCenter - (x - xCenter);
                ySym = yCenter - (y - yCenter);

                points_in_circle.push({ x: x, y: y});
                points_in_circle.push({ x: x, y: ySym});
                points_in_circle.push({ x: xSym, y: y});
                points_in_circle.push({ x: xSym, y: ySym});
            }
        }
    }

    return points_in_circle;
}
