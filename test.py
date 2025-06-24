from EasySearch.sousuo import ENGINE_CONFIG

for engine in ENGINE_CONFIG:
    print(engine)
    print(ENGINE_CONFIG[engine].get("url"))
