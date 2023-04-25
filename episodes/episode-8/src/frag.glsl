#version 300 es

precision lowp float;
precision lowp sampler2DArray;

out vec4 fragment_colour;

uniform sampler2DArray texture_array_sampler;

in vec3 local_position;
in vec3 interpolated_tex_coords;
in float interpolated_shading_value;

void main(void) {
	fragment_colour = texture(texture_array_sampler, interpolated_tex_coords);
	fragment_colour.rgb *= interpolated_shading_value;
}