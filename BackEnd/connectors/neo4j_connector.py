from neo4j import GraphDatabase


class Neo4jConnector:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]

# Membuat objek konektor Neo4j
neo4j_conn = Neo4jConnector("bolt://localhost:7690", "neo4j", "stev12345")
