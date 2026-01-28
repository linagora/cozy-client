[cozy-client](../README.md) / [models](models.md) / geo

# Namespace: geo

[models](models.md).geo

## Functions

### computeSpeed

▸ **computeSpeed**(`distance`, `duration`): `number`

Compute the speed from distance and duration

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `distance` | `number` | The distance in meters |
| `duration` | `number` | The duration in seconds |

*Returns*

`number`

*   The speed, in m/s, rounded to 2 decimals

*Defined in*

[packages/cozy-client/src/models/geo.js:12](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/geo.js#L12)

***

### computeSphericalCenter

▸ **computeSphericalCenter**(`coordinates`): `Coordinates`

Compute the geographical center of the given points

This consists of finding the centroid of a set of points
in a sphere.
Note this assumes the Earth is a perfect sphere, which is not,
but the approximation should be good enough.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | `Coordinates`\[] | The geo points |

*Returns*

`Coordinates`

The center point

*Defined in*

[packages/cozy-client/src/models/geo.js:104](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/geo.js#L104)

***

### deltaLatitude

▸ **deltaLatitude**(`distance`): `number`

Compute the latitude delta from a distance, in meters.

The reasoning is rather simple: there are 360° of latitudes of same distance.
Then, it consists of computing 1 degree distance, and divide the
given distance by this value.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `distance` | `number` | The distance in meters |

*Returns*

`number`

The delta latitude degrees

*Defined in*

[packages/cozy-client/src/models/geo.js:172](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/geo.js#L172)

***

### deltaLongitude

▸ **deltaLongitude**(`latitude`, `distance`): `number`

Compute the longitude delta from a distance, in meters.

This requires the latitude: we want to compute the horizontal delta
on the Earth surface. As it is a sphere (kind of), this delta won't be
the same depending on whether it is on the equator (min variation)
or on the poles (max variation), for instance.

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `latitude` | `number` | The latitude |
| `distance` | `number` | The distance in meters |

*Returns*

`number`

the longitude delta degrees

*Defined in*

[packages/cozy-client/src/models/geo.js:155](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/geo.js#L155)

***

### geodesicDistance

▸ **geodesicDistance**(`point1`, `point2`): `number`

Compute the distance between 2 geographic points, in meters.

This is an implementation of the Haversine formula, that
supposes a perfect sphere. We know this is not exactly the case
for Earth, especially at the poles, but this approximation is good enough.
More complex methods do exist, such as Vincenty formula, but we prefer
simplicity over precision here.
See https://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid

*Parameters*

| Name | Type | Description |
| :------ | :------ | :------ |
| `point1` | `Coordinates` | The first point coordinates, in decimal degrees |
| `point2` | `Coordinates` | The second point coordinates, in decimal degrees |

*Returns*

`number`

The distance between the points, in meters, rounded to 2 decimals

*Defined in*

[packages/cozy-client/src/models/geo.js:65](https://github.com/linagora/cozy-client/blob/master/packages/cozy-client/src/models/geo.js#L65)
