import pygletAdapter from "../../adapter.js";
const gl = pygletAdapter.gl;

// define constant values for the chunk's dimensions

const chunkWidth = 16
const chunkHeight = 16
const chunkLength = 16

class Chunk {
	constructor(world, chunk_position) {
		this.chunk_position = chunk_position;
		
		this.position = [ // get a world-space position for the chunk
			this.chunk_position[0] * chunkWidth,
			this.chunk_position[1] * chunkHeight,
			this.chunk_position[2] * chunkLength];
		
		 this.world = world

        this.blocks = Array.from({ length: chunkWidth }, () => Array.from({ length: chunkHeight }, () => Array.from({ length: const chunkLength = 16 }, () => 0))); // create an array of blocks filled with "air" (block number 0)

		// mesh variables

		this.hasMesh = false;

		this.meshVertexPositions = [];
		this.meshTexCoords = [];
		this.meshShadingValues = [];

		this.meshIndexCounter = 0;
		this.meshIndices = [];

		// create vertex array object

		this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

		// create vertex position vbo

		this.vertexPositionVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionVbo);
		
		// create tex coord vbo

        this.texCoordVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordVbo);

		// create shading values vbo

        this.shadingValueVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.shadingValueVbo);

		// create index buffer object

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    }
	
	updateMesh() {
		// reset all the mesh-related values

		this.hasMesh = false;

		this.meshVertexPositions = [];
		this.meshTexCoords = [];
		this.meshShadingValues = [];

		this.meshIndexCounter = 0;
		this.meshIndices = [];

		const addFace = (blockType, position, face) => { // add a face to the chunk mesh
			let vertexPositions = blockType.vertexPositions[face].slice() // get the vertex positions of the face to be added

			for (let i; i < 4; i++) { // add the world-space position of the face to it's vertex positions
				vertexPositions[i * 3 + 0] += position[0];
				vertexPositions[i * 3 + 1] += position[1];
			    vertexPositions[i * 3 + 2] += position[2];
            }
			
			 this.meshVertexPositions.push(...vertexPositions); // add those vertex positions to the chunk mesh's vertex positions

			let indices = [0, 1, 2, 0, 2, 3]; // create a list of indices for the face's vertices
			for (let i; i < 6; i++) { // shift each index by the chunk mesh's index counter so that no two faces share the same indices
				indices[i] +=  this.meshIndexCounter;
            }
			
			 this.meshIndices.push(...indices); // add those indices to the chunk mesh's indices
			 this.meshIndexCounter += 4; // add 4 (the amount of vertices in a face) to the chunk mesh's index counter

			 this.meshTexCoords.push(...blockType.texCoords[face]); // add the face's texture coordinates to the chunk mesh's texture coordinates
			 this.meshShadingValues.extend(...blockType.shadingValues[face]); // add the face's shading values to the chunk mesh's shading values
        }
        
		// iterate through all local block positions in the chunk

        for (let localX; localX < chunkWidth; localX++) {
			for local_y in range(CHUNK_HEIGHT):
            for (let localY; localY < chunkHeight; localY++) {
				for local_z in range(CHUNK_LENGTH):
					block_number =  this.blocks[local_x][local_y][local_z] // get the block number of the block at that local position

					if block_number: // check if the block is not air
						block_type =  this.world.block_types[block_number] // get the block type

						x, y, z = ( // get the world-space position of the block
							 this.position[0] + local_x,
							 this.position[1] + local_y,
							 this.position[2] + local_z)
						
						// check for each block face if it's hidden by another block, and add that face to the chunk mesh if not

						if not  this.world.get_block_number((x + 1, y, z)): add_face(0)
						if not  this.world.get_block_number((x - 1, y, z)): add_face(1)
						if not  this.world.get_block_number((x, y + 1, z)): add_face(2)
						if not  this.world.get_block_number((x, y - 1, z)): add_face(3)
						if not  this.world.get_block_number((x, y, z + 1)): add_face(4)
						if not  this.world.get_block_number((x, y, z - 1)): add_face(5)
		
		// pass mesh data to gpu

		if not  this.mesh_index_counter: // make sure there actually is data in the mesh
			return

		gl.glBindVertexArray( this.vao) // bind the VAO

		// pass the mesh data to the vertex position VBO

		gl.glBindBuffer(gl.GL_ARRAY_BUFFER,  this.vertex_position_vbo)
		gl.glBufferData(
			gl.GL_ARRAY_BUFFER,
			ctypes.sizeof(gl.GLfloat * len( this.mesh_vertex_positions)),
			(gl.GLfloat * len( this.mesh_vertex_positions)) (* this.mesh_vertex_positions),
			gl.GL_STATIC_DRAW)
		
		gl.glVertexAttribPointer(0, 3, gl.GL_FLOAT, gl.GL_FALSE, 0, 0)
		gl.glEnableVertexAttribArray(0)
		
		// pass the mesh data to the texture coordinates VBO

		gl.glBindBuffer(gl.GL_ARRAY_BUFFER,  this.tex_coord_vbo)
		gl.glBufferData(
			gl.GL_ARRAY_BUFFER,
			ctypes.sizeof(gl.GLfloat * len( this.mesh_tex_coords)),
			(gl.GLfloat * len( this.mesh_tex_coords)) (* this.mesh_tex_coords),
			gl.GL_STATIC_DRAW)
		
		gl.glVertexAttribPointer(1, 3, gl.GL_FLOAT, gl.GL_FALSE, 0, 0)
		gl.glEnableVertexAttribArray(1)

		// pass the mesh data to the shading values VBO
		
		gl.glBindBuffer(gl.GL_ARRAY_BUFFER,  this.shading_values_vbo)
		gl.glBufferData(
			gl.GL_ARRAY_BUFFER,
			ctypes.sizeof(gl.GLfloat * len( this.mesh_shading_values)),
			(gl.GLfloat * len( this.mesh_shading_values)) (* this.mesh_shading_values),
			gl.GL_STATIC_DRAW)

		gl.glVertexAttribPointer(2, 1, gl.GL_FLOAT, gl.GL_FALSE, 0, 0)
		gl.glEnableVertexAttribArray(2)
		
		// pass the mesh data to the IBO

		gl.glBindBuffer(gl.GL_ELEMENT_ARRAY_BUFFER,  this.ibo)
		gl.glBufferData(
			gl.GL_ELEMENT_ARRAY_BUFFER,
			ctypes.sizeof(gl.GLuint * len( this.mesh_indices)),
			(gl.GLuint * len( this.mesh_indices)) (* this.mesh_indices),
			gl.GL_STATIC_DRAW)
    }
	
	def draw(self):
		if not  this.mesh_index_counter: // make sure there actually is data in the mesh
			return
		
		// draw the VAO

		gl.glBindVertexArray( this.vao)

		gl.glDrawElements(
			gl.GL_TRIANGLES,
			len( this.mesh_indices),
			gl.GL_UNSIGNED_INT,
			None)
}

export default Chunk;