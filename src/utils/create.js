const create = {
	db: (database) => ({
		from: (table) => {
			return {
				getById: async (id) => {
					const response = await fetch("http://localhost/apimotorx20/apiquery.php", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							db: database,
							table: [table],
							id: [id],
						}),
					});
					const data = await response.json();
					if (data.length > 0) {
						return data[0];
					}
					return null;
				},
			};
		},
	}),
};

export default create;
