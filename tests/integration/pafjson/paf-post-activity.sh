java -jar brix-tool-pafclient-0.2-jar-with-dependencies.jar -m POST \
	-h "Content-Type: application/vnd.pearson.paf.v1.envelope+json;body=\"application/vnd.pearson.sanvan.v1.activity\"\"" \
	-d $1 \
	-u http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities -c
