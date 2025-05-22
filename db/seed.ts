import { db, Post, PostContent } from "astro:db";

const esPostContent = String.raw`<p>
            Esto está fuertemente inspirado por la <a
              href="https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/"
              target="_blank"
              rel="noopener noreferrer">perspectiva de Thomas Vanderstraeten</a
            >
          </p>
          <section id="table-of-contents">
            <h1>Tabla de contenidos</h1>
            <ul class="sub-list">
              <li>
                <a href="#introduction">Introducción</a>
              </li>
              <li>
                <a href="#inspired-by">Inspirado por</a>
              </li>
              <li>
                <a href="#shift-rationale">Justificación</a>
              </li>
              <li>
                <a href="#implementation-details">Detalles de implementación</a>
              </li>
              <li>
                <a href="#code-snippets">Fragmentos de código</a>
                <ul class="sub-list">
                  <li><a href="#middleware">Middleware</a></li>
                  <li><a href="#repositories">Repositorios</a></li>
                  <li>
                    <a href="#tenant-connections-management"
                      >Gestión de conexiones de tenants</a
                    >
                  </li>
                  <li>
                    <a href="#tenant-database-creation"
                      >Creación de base de datos de tenants</a
                    >
                  </li>
                  <li>
                    <a href="#tenant-database-migration"
                      >Migración de base de datos de tenants</a
                    >
                  </li>
                </ul>
              </li>
              <li>
                <a href="#closing-thoughts">Reflexiones finales</a>
              </li>
              <li>
                <a href="#comment-section">Comentarios</a>
              </li>
            </ul>
          </section>
          <div class="post-content">
            <div id="introduction">
            <h1>Introducción</h1>
            <p>
              Al construir nuestra plataforma SaaS de gestión de la construcción, enfrentamos
              el desafío crítico de implementar la multitenencia para garantizar
              el aislamiento de datos y una experiencia personalizada para cada cliente.
              Inicialmente inspirados por la excelente publicación de blog de Thomas Vanderstraeten
              sobre multitenencia basada en esquemas con NestJS, TypeORM y
              PostgreSQL, nuestro enfoque evolucionó significativamente para aprovechar una
              arquitectura de base de datos por tenant. Esta publicación describe nuestro recorrido
              y el fundamento detrás de este cambio, detallando cómo
              implementamos un aislamiento de tenants robusto utilizando instancias de base de datos
              dedicadas.
            </p>
          </div>
            <div id="inspired-by">
              <h1>Inspirado por</h1>
              <p>
                El artículo de Thomas Vanderstraeten proporcionó una valiosa base
                para comprender los principios fundamentales de la multitenencia dentro del
                ecosistema de NestJS. Su exploración del aislamiento basado en esquemas
                destacó consideraciones clave como la identificación de tenants y
                la gestión de conexiones. Si bien inicialmente consideramos este
                enfoque, nuestros requisitos específicos para un aislamiento mejorado y
                escalabilidad nos llevaron por un camino diferente. Los conceptos
                fundamentales y las consideraciones discutidas en su publicación no se
                repetirán aquí, ya que nos centraremos en nuestra implementación distintiva.
              </p>
              <p>
                También es importante reconocer la significativa influencia del
                perspicaz libro de Tod Golding, "Building Multi-tenant SaaS
                Architectures" en nuestras decisiones arquitectónicas. En particular,
                la separación de responsabilidades y los conceptos de un plano de control
                y un plano de aplicación, que elaboraremos más adelante, fueron
                fuertemente inspirados por el valioso marco proporcionado en su libro
                para construir sistemas multitenant robustos.
              </p>
            </div>
            <div id="shift-rationale">
              <h1>Justificación</h1>
              <p>
                Nuestra decisión de pasar de esquemas compartidos a instancias de
                base de datos individuales para cada tenant fue impulsada por
                varios factores:
              </p>
              <ul>
                <li>
                  <p>
                    <strong>Aislamiento de datos mejorado:</strong> La separación
                    completa a nivel de base de datos proporciona la garantía más
                    sólida de privacidad y seguridad de los datos para cada tenant.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Escalabilidad y rendimiento: </strong>
                    El aislamiento de los tenants en sus propias bases de datos puede
                    conducir a un mejor rendimiento y escalabilidad, ya que las
                    operaciones de la base de datos se limitan a los datos de un
                    solo tenant.
                  </p>
                </li>
                <li>
                  <p>
                    <strong> Personalización y flexibilidad: </strong>
                    Las bases de datos individuales permiten una mayor flexibilidad
                    en términos de configuraciones de base de datos específicas
                    para cada tenant, extensiones e incluso,
                    potencialmente, diferentes versiones de base de datos en el futuro.
                  </p>
                </li>
                <li>
                  <p>
                    <strong> Copias de seguridad y restauraciones simplificadas: </strong>
                    La gestión de copias de seguridad y restauraciones se vuelve más
                    simple y granular cuando cada tenant tiene su propia base de datos.
                  </p>
                </li>
              </ul>
            </div>
            <div id="implementation-details">
              <h2>
                Cómo implementamos una solución de base de datos por tenant en nuestra aplicación NestJS
              </h2>
              <ul>
                <li>
                  <p>
                    <strong>Identificación de tenants:</strong> Siguiendo los principios
                    descritos en la publicación de Vanderstraeten, implementamos un
                    enfoque basado en subdominios para la identificación de tenants.
                    En lugar de un identificador asignado por el sistema, cada tenant
                    elige un nombre único que luego se convierte en
                    su subdominio dedicado (por ejemplo, nombredetenantelegido.mysaas.com).
                    Este identificador elegido se analiza a partir del origen de la solicitud,
                    sirviendo como clave para establecer una conexión de base de datos
                    dedicada para ese tenant específico. Es crucial enfatizar que
                    estos nombres de subdominio elegidos por el tenant se someten a una
                    rigurosa sanitización para garantizar la seguridad
                    y prevenir cualquier vulnerabilidad potencial.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Conexiones dinámicas a la base de datos:</strong> Para esto, implementamos
                    un sistema para establecer y administrar conexiones a instancias de
                    base de datos de PostgreSQL separadas en tiempo de ejecución.
                  </p>
                  <ul class="sub-list">
                    <li>
                      <p>
                        Para manejar las conexiones a bases de datos de tenants individuales,
                        empleamos un enfoque híbrido para almacenar los detalles de conexión.
                        Mientras que ciertos parámetros fundamentales como el host de la base de datos
                        se almacenaron en nuestra base de datos central, las
                        configuraciones de conexión necesarias restantes se gestionaron
                        a través de un objeto de configuración centralizado,
                        aprovechando las variables de entorno.
                      </p>
                    </li>
                    <li>
                      <p>
                        El proceso de creación y recuperación de conexiones a bases de datos
                        específicas para tenants se orquestó utilizando un patrón
                        singleton. Esto aseguró que las conexiones a la base de datos se
                        recuperaran de forma perezosa: ya sea accediendo a una conexión
                        existente almacenada en un Map interno dentro de la instancia
                        singleton o estableciendo dinámicamente una nueva conexión
                        cuando no existía una. Las conexiones recién creadas se
                        almacenaban luego en un Map para su posterior reutilización. Todo este
                        proceso fue gestionado por un middleware. Este
                        middleware desempeñó un papel crucial en la intercepción de cada
                        solicitud, la identificación del tenant y la vinculación de la
                        DataSource correspondiente al objeto de solicitud. Esta
                        DataSource adjunta estaba entonces fácilmente disponible para la
                        creación dinámica de repositorios con alcance de solicitud,
                        asegurando que todas las operaciones de acceso a datos se
                        dirigieran a la base de datos del tenant correcto.
                      </p>
                    </li>
                  </ul>
                </li>
                <li>
                  <p>
                    <strong>Creación de base de datos de tenants: </strong> Para manejar la creación
                    de nuevas bases de datos de tenants, implementamos un proceso asíncrono
                    aprovechando el módulo Queues de NestJS (@nestjs/bullmq, BullMQ). Al
                    finalizar el proceso de incorporación de un nuevo tenant, se agregaba un trabajo
                    a la cola para iniciar la configuración de la base de datos. Un consumidor o
                    procesador dedicado recuperaba luego toda la información necesaria del tenant
                    y establecía una conexión temporal a la base de datos predeterminada "postgres". Esta
                    conexión se utilizó para ejecutar una consulta de creación de base de datos para el
                    nuevo tenant. Posteriormente, el procesador ejecutaría todas las migraciones
                    de base de datos necesarias, migraría cualquier dato temporal relevante y,
                    finalmente, actualizaría nuestra tabla de tenants con los nuevos detalles de conexión
                    de la base de datos. Este enfoque asíncrono aseguró que el proceso de creación de la base de datos
                    no bloqueara el flujo de incorporación, proporcionando una experiencia de usuario más fluida.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Migración de base de datos de tenants: </strong> Para gestionar las
                    actualizaciones del esquema de la base de datos en todos los tenants, desarrollamos un script
                    TypeScript dedicado. Este script, ejecutado usando tsx, inició el proceso
                    de migración estableciendo primero una nueva conexión DataSource a nuestra
                    tabla de tenants. Luego consultó esta tabla para recuperar una lista de
                    todos los tenants activos. Para cada tenant identificado, el script
                    construyó dinámicamente una nueva conexión DataSource usando los parámetros
                    específicos del tenant almacenados en el registro y nuestras variables de entorno.
                    Una vez establecidas estas conexiones específicas del tenant, el script
                    ejecutó las migraciones de base de datos necesarias para cada tenant
                    individual, asegurando que su esquema estuviera actualizado. Además, este
                    script fue diseñado para ser flexible, aceptando argumentos numerados
                    a través de la interfaz de línea de comandos (CLI) para permitir ejecuciones de
                    migración dirigidas a tenants específicos, proporcionando un control granular
                    sobre el proceso de actualización.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Capa de acceso a datos:</strong> Nuestra Capa de Acceso a Datos (DAL)
                    fue diseñada con un fuerte énfasis en la desvinculación de la lógica central de
                    nuestra aplicación de las complejidades de la multitenencia. Para lograr esto,
                    nuestros repositorios y servicios permanecen ajenos al contexto de tenant
                    subyacente. Esta separación de preocupaciones se facilitó mediante
                    un uso estratégico de middleware y un servicio dedicado de gestión
                    de conexiones. Esto se logró a través de: Middleware para la inyección de DataSource,
                    servicio de gestión de conexiones Singleton, servicios y repositorios ajenos
                    al tenant.
                  </p>
                  <p>Este patrón de diseño proporcionó varios beneficios clave:</p>
                  <ul class="sub-list">
                    <li>
                      <p>
                        <strong> Código limpio: </strong>
                        Nuestra lógica de negocio central se mantuvo enfocada en sus responsabilidades
                        principales, sin estar abarrotada de código específico de la tenencia.
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong> Mantenibilidad: </strong>
                        Los cambios en la implementación de la multitenencia (por ejemplo, cómo se
                        identifican los tenants o cómo se gestionan las conexiones) podrían
                        realizarse dentro del middleware y el servicio de gestión de conexiones
                        sin requerir modificaciones en los repositorios o servicios.
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong> Testabilidad: </strong>
                        Probar nuestros servicios y repositorios se volvió más simple, ya que
                        podíamos simular fácilmente la DataSource inyectada sin necesidad de
                        simular todo el contexto de tenencia.
                      </p>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <div id="code-snippets">
             <h2>Ejemplos de código</h2>
              <div id="#middleware" class="code-snippet">
                <p>
                  Para iniciar el proceso de conexión dinámica de tenants,
                  implementamos un middleware de NestJS. Este middleware, como
                  se ilustra en el fragmento de código a continuación, desempeña un papel
                  crucial en la identificación del tenant basándose en la solicitud
                  entrante y en la disponibilidad de la conexión a la base de datos
                  correspondiente para el acceso posterior a los datos. Aunque el código
                  también incluye la vinculación de una clave
                  <code>ENTITY_MANAGER_KEY</code> para la gestión transaccional, aquí
                  nos centraremos en la lógica central de la conexión de tenants.
                </p>
                <pre><code class="language-typescript">import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { TenantConnectionsService } from '@/application/modules/common/tenant-connections.service'
import { ENTITY_MANAGER_KEY } from './tenant-transactions.interceptor'

export const TENANT_QUERY_RUNNER = 'tenant-query-runner'

@Injectable()
export class TenantConnectionMiddleware implements NestMiddleware {
  constructor(private readonly tenantConnectionsService: TenantConnectionsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const protocol = process.env.PROTOCOL
    const host = process.env.HOST

    // Aquí solo deberias escapar el punto literal; tuve algunos problemas al intentar mostrar este código.

    const originPartsToRemove: RegExp = new RegExp(String.raw\`\${protocol}|$\{host}|\\.\`, 'g')
    const tenantIdentifier: string = req.headers.origin.replaceAll(originPartsToRemove, '')

    const tenantQueryRunner = (
      await this.tenantConnectionsService.get(tenantIdentifier)
    ).createQueryRunner()

    req[TENANT_QUERY_RUNNER] = tenantQueryRunner

    req[ENTITY_MANAGER_KEY] = tenantQueryRunner.manager

    next()
  }
}</code></pre>
                                 <p>
                    Profundicemos en la funcionalidad de este middleware.
                    Aprovechando la inyección de dependencias de NestJS, inyectamos el
                    <code
                      >TenantConnectionsService</code
                    >, que es responsable de gestionar y recuperar
                    las conexiones a bases de datos específicas de cada tenant. Dentro del método
                    <code>use</code>, reside la lógica central. Primero, para mayor claridad y
                    conveniencia, asignamos las variables de entorno <code>PROTOCOL</code> y
                    <code>HOST</code> a constantes locales. A continuación, definimos la Expresión
                    Regular <code>originPartsToRemove</code>. Esta expresión se construye para
                    coincidir con el protocolo (por ejemplo, <code>http://</code> o
                    <code>https://</code>), el host principal de nuestra aplicación y cualquier
                    punto literal. Al reemplazar estas partes coincidentes del encabezado
                    <code>origin</code> de la solicitud, aislamos eficazmente el
                    <code>tenantIdentifier</code>, que, como se estableció anteriormente,
                    corresponde al subdominio único elegido por el tenant.
                  </p>
                  <p>
                    Con el <code>tenantIdentifier</code> extraído, utilizamos el método
                    <code>get</code> del <code>TenantConnectionsService</code> para recuperar la
                    DataSource apropiada para ese tenant específico. Posteriormente, creamos un
                    QueryRunner a partir de esta DataSource. Este
                    <code>tenantQueryRunner</code> se adjunta al objeto de solicitud usando la
                    clave <code>TENANT_QUERY_RUNNER</code>, haciéndolo disponible para operaciones
                    posteriores. Además, también adjuntamos el <code>manager</code> (el
                    EntityManager) del QueryRunner a la solicitud, que se utiliza para recuperar
                    repositorios de entidades dentro del ciclo de vida de la solicitud.
                  </p>
                  </div>
              <div id="#repositories" class="code-snippet">
                <h3>Repositorios</h3>
                <p>
                  A continuación, examinemos cómo el <code>EntityManager</code> específico del
                  tenant, adjunto a la solicitud por nuestro middleware, se utiliza dentro
                  de nuestra capa de acceso a datos. Para optimizar la creación de
                  repositorios y evitar código repetitivo en nuestros repositorios
                  específicos de entidades, implementamos una clase base
                  <code>BaseRepository</code> extendible. Esta clase base encapsula la lógica
                  para recuperar la instancia <code>Repository</code> de TypeORM apropiada
                  utilizando el <code>EntityManager</code> de la solicitud. Aquí está la
                  implementación de nuestro <code>BaseRepository</code>:
                </p>
                <pre><code class="language-typescript">
import { EntityManager, EntitySchema, ObjectLiteral, Repository } from 'typeorm';
import { ENTITY_MANAGER_KEY } from './tenant-transactions.interceptor';
import { Request } from 'express';

export class BaseRepository {
  constructor(private request: Request & { [ENTITY_MANAGER_KEY]: EntityManager }) {}

  protected getRepository<T extends ObjectLiteral>(
    entityCls: EntitySchema
  ): Repository<T> {
    const entityManager: EntityManager = this.request[ENTITY_MANAGER_KEY];

    if (!entityManager) {
      throw new Error('No EntityManager found on the request.');
    }

    return entityManager.getRepository(entityCls);
  }
}
                </code></pre>
                <p>
                  Como se puede observar en el <code>BaseRepository</code>, el constructor
                  recibe el objeto de solicitud, el cual hemos aumentado para incluir el
                  <code>EntityManager</code> bajo la clave <code>ENTITY_MANAGER_KEY</code>. El
                  método protegido <code>getRepository</code> accede entonces a este
                  <code>EntityManager</code> desde la solicitud y lo utiliza para recuperar el
                  <code>Repository</code> de TypeORM para un esquema de entidad dado. Esto
                  asegura que cada instancia de repositorio opere dentro del contexto de la
                  conexión a la base de datos del tenant actual.
                </p>
                <p>
                  Los repositorios concretos dentro de nuestra aplicación extienden este
                  <code>BaseRepository</code> y, al aprovechar el método
                  <code>getRepository</code>, obtienen acceso al repositorio de entidad con el
                  ámbito correcto. Aquí hay un ejemplo de cómo se implementaría un
                  <code>ExampleRepository</code>:
                </p>
                <pre><code class="language-typescript">
import { Injectable, Scope, Repository } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { ExampleEntity } from './example.entity';
import { ExampleEntitySchema } from './example.schema';
import { ENTITY_MANAGER_KEY } from '../tenant-transactions.interceptor';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ExampleRepository extends BaseRepository {
  private repository: Repository<ExampleEntity>;

  constructor(@Inject(REQUEST) private readonly req: Request & { [ENTITY_MANAGER_KEY]: EntityManager }) {
    super(req);
    this.repository = this.getRepository(ExampleEntitySchema);
  }

  // Metodos del repositorio (e.g., findOne, find, save, etc.)

}
                </code></pre>
                <p>
                  En este <code>ExampleRepository</code>, primero definimos su alcance como
                  <code>REQUEST</code>, asegurando que se cree una nueva instancia para cada
                  solicitud entrante. Al extender <code>BaseRepository</code> y llamar al método
                  <code>getRepository</code> dentro de su constructor, obtenemos el repositorio
                  específico del tenant para la <code>ExampleEntity</code>. Esto abstrae
                  elegantemente la gestión de la tenencia subyacente, permitiendo que nuestros
                  repositorios se centren únicamente en las preocupaciones de acceso a datos
                  dentro del contexto del tenant correcto. Aunque el término "repositorio" se
                  menciona con frecuencia, este patrón demostró ser la solución más sencilla y
                  fácil de mantener para garantizar un aislamiento de datos adecuado en nuestra
                  arquitectura multi-tenant.
                </p>
              </div>
              <div id="#tenant-connections-management" class="code-snippet">
                <h3>Gestión de conexiones de tenants</h3>
                <p>
                  Para centralizar la gestión y recuperación de conexiones a bases de datos
                  específicas de cada tenant, implementamos un
                  <code>TenantConnectionsService</code> dedicado. Dada la naturaleza singleton
                  de los servicios de NestJS dentro de su ámbito definido, este enfoque asegura
                  que la lógica de gestión de conexiones se maneje de manera consistente y
                  eficiente en toda la aplicación. Este diseño simplifica futuras
                  modificaciones o mejoras en nuestro proceso de recuperación de conexiones.
                  Examinemos la implementación:
                </p>
                <pre><code class="language-typescript">
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'path';

import { connectionSource as controlDataSource } from '@/config/db/control-orm.config';
import { TenantSchema } from '@/control/modules/tenancy/tenants/schemas/tenant.schema';
import { Tenant } from '@/control/modules/tenancy/tenants/entities/tenant.entity';
import { tenantOrmConfig } from '@/config/db/application-orm.config';

@Injectable()
export class TenantConnectionsService {
  readonly #tenantConnections: Map<string, DataSource> = new Map();

  constructor() {}

  #generateTenantDbName(tenant: Tenant) {
    return "tenant_" + tenant.name
  }

  async #initializeDataSource(dataSource: DataSource): Promise<DataSource> {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    return dataSource;
  }

  async get(name: string): Promise<DataSource> {
    const cachedDataSource = this.#tenantConnections.get(name);
    if (cachedDataSource) {
      return await this.#initializeDataSource(cachedDataSource);
    }

    if (!controlDataSource.isInitialized) {
      await controlDataSource.initialize();
    }

    const tenant = await controlDataSource.getRepository(TenantSchema).findOneBy({ name });

    if (!tenant) throw new Error('Could not find tenant ' + name)

    const dataSourceOptions: PostgresConnectionOptions = {
      ...tenantOrmConfig,
      host: tenant.databaseHost,
      database: this.#generateTenantDbName(tenant),
      entities: [join(__dirname, '../../**/*.schema{.js,.ts}')],
    };

    const newDataSource = new DataSource(dataSourceOptions);
    this.#tenantConnections.set(tenant.name, newDataSource);
    return await this.#initializeDataSource(newDataSource);
  }
}
                </code></pre>
                <p>
                  Este <code>TenantConnectionsService</code> mantiene un <code>Map</code> llamado
                  <code>#tenantConnections</code>, que sirve como caché para almacenar instancias
                  <code>DataSource</code> específicas de cada tenant, indexadas por el
                  identificador único del tenant (<code>name</code>). El método
                  <code>get</code> es la interfaz principal para recuperar una
                  <code>DataSource</code> para un tenant dado. Primero verifica si existe una
                  <code>DataSource</code> para el <code>name</code> del tenant solicitado en
                  la caché. Si se encuentra, devuelve la instancia (potencialmente ya
                  inicializada) después de asegurarse de que esté inicializada.
                </p>
                <p>
                  Si no se encuentra una <code>DataSource</code> para el tenant en la caché,
                  el servicio interactúa con nuestra base de datos "de control" central
                  (utilizando <code>controlDataSource</code>) para buscar la entidad
                  <code>Tenant</code> basándose en el <code>name</code> proporcionado.
                  Intencionadamente, solo almacenamos el host de la base de datos del tenant
                  en esta base de datos central, optando por un enfoque más simplificado,
                  aunque otros parámetros de conexión podrían almacenarse aquí para una mayor
                  flexibilidad si fuera necesario. El nombre real de la base de datos del
                  tenant se genera dinámicamente utilizando el método
                  <code>#generateTenantDbName</code>.
                </p>
                <p>
                  Una vez recuperada la entidad <code>Tenant</code>, construimos las
                  <code>PostgresConnectionOptions</code> para la base de datos del tenant
                  fusionando nuestra <code>tenantOrmConfig</code> base con el
                  <code>databaseHost</code> específico del tenant y el nombre de la base de
                  datos generado dinámicamente. Es importante destacar que la ruta de las
                  <code>entities</code> se configura para que apunte a los archivos de esquema
                  compilados dentro del plano de la aplicación, asegurando que TypeORM pueda
                  mapear correctamente las entidades a la base de datos del tenant.
                  Finalmente, se crea una nueva instancia de <code>DataSource</code> utilizando
                  estas opciones, se almacena en el mapa
                  <code>#tenantConnections</code> para uso futuro, se inicializa y luego se
                  devuelve. El método <code>#initializeDataSource</code> asegura que la
                  <code>DataSource</code> se inicialice solo una vez, incluso si el método
                  <code>get</code> se llama varias veces para el mismo tenant.
                </p>
              </div>
              <div id="#tenant-database-creation" class="code-snippet">
                <h3>Creación de bases de datos de tenants</h3>
                <p>
                  Abordaremos la explicación de la creación de bases de datos de tenants
                  de manera diferente, centrándonos en la naturaleza asíncrona del
                  proceso. Como se destaca en "Building Multi-tenant SaaS Architectures" de Tod
                  Golding, una experiencia de incorporación fluida y fácil de usar es primordial.
                  Con esto en mente, nuestro flujo de incorporación en el plano de control
                  permite a los tenants proporcionar información de forma incremental e incluso
                  salir y regresar más tarde. Durante esta fase, se crea un registro de tenant
                  en nuestra base de datos de control, pero no se asocia inmediatamente con una
                  base de datos de aplicación dedicada o un subdominio. Estos se aprovisionan
                  más tarde a través de un proceso de actualización. Si bien esto introduce un
                  ligero retraso entre el registro inicial y la activación completa del tenant,
                  subraya la flexibilidad de nuestro sistema, permitiendo que la creación de la
                  base de datos ocurra tan pronto como la información necesaria esté disponible
                  o después de un proceso de incorporación más prolongado.
                </p>
                <p>
                  Así que, examinemos la configuración inicial del consumidor de la cola
                  responsable de este proceso:
                </p>
                <pre><code class="language-typescript">
import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import { TENANT_SETUP_KEY } from './constants'
import { TenantsRepository } from '@/control/modules/tenancy/tenants/repositories/tenants.repository'
import { TempUsersRepository } from '@/control/modules/onboarding/repositories/temp-users.repository'
import { EmailSenderService } from '@/application/modules/common/email/email-sender.service'
import { TenantSetupGateway } from '@/application/gateways/tenant-setup.gateway'

@Processor(TENANT_SETUP_KEY)
@Injectable()
export class TenantSetup extends WorkerHost {
  #dataSourceOpts: PostgresConnectionOptions | null = null // Explicado despues

  constructor(
    private readonly tenantsRepository: TenantsRepository,

    // Este repositorio de "TempUsers" maneja los usuarios creados durante el proceso de onboarding.

    // Nuestro proceso de migración transferirá estos usuarios a la base de datos dedicada del tenant.

    private readonly tempUsersRepository: TempUsersRepository,
    private readonly logger: Logger = new Logger(TenantSetup.name),
    private readonly emailSenderService: EmailSenderService,
    private readonly tenantSetupGateway: TenantSetupGateway
  ) {
    super()
  }

  // ...

}
                </code></pre>
                <p>
                  Aquí, definimos <code>TenantSetup</code> como un <a
                    href="https://docs.nestjs.com/techniques/queues#consumers"
                    target="_blank"
                    rel="noopener noreferrer">Consumidor</a
                  > de NestJS, decorado con <code>@Processor(TENANT_SETUP_KEY)</code>. Este
                  decorador instruye a BullMQ a escuchar trabajos con el identificador
                  <code>TENANT_SETUP_KEY</code>. El constructor de este consumidor inyecta varias
                  dependencias que se utilizarán durante el proceso de creación de la base de
                  datos del tenant. En particular, estas incluyen repositorios para acceder a
                  los datos de tenants y usuarios temporales en el plano de control, un logger
                  para obtener información operativa, un <code>EmailSenderService</code> para
                  posibles notificaciones y un <code>TenantSetupGateway</code>. Si bien el
                  <code>Logger</code>, <code>EmailSenderService</code> y
                  <code>TenantSetupGateway</code> son específicos de nuestra implementación
                  para un registro mejorado y una experiencia de incorporación fluida, la lógica
                  central para la creación de la base de datos gira en torno a las interacciones
                  del repositorio. La propiedad privada <code>#dataSourceOpts</code>, que
                  explicaremos a continuación, contendrá la configuración para la conexión a la
                  base de datos del nuevo tenant.
                </p>
                <h4>Núcleo</h4>
                <p>
                  Como vimos en el consumidor <code>TenantSetup</code>, el método
                  <code>process</code> orquesta la creación de una nueva base de datos de
                  tenants. Esto implica varios métodos auxiliares dentro del consumidor.
                  Comencemos examinando la configuración de las opciones de
                  <code>DataSource</code> específicas del tenant:
                </p>
                <p>
                  El método <code>#setDataSourceOpts</code> es responsable de construir el objeto
                  de configuración necesario para conectarse a la base de datos del nuevo
                  tenant. Este método aprovecha la <code>tenantOrmConfig</code> base, que es
                  un objeto <code>PostgresConnectionOptions</code> importado de TypeORM. Esta
                  configuración base suele incluir parámetros de conexión definidos a través de
                  variables de entorno y configuraciones generales de la aplicación. Luego
                  sobrescribimos opciones específicas con información específica del tenant
                  recuperada de nuestra base de datos del plano de control. También utilizamos
                  el método <code>#generateTenantDbName</code> para establecer un nombre de base
                  de datos para cada tenant.
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  #generateTenantDbName(tenant: Tenant): string {
    return "tenant_" + tenant.name
  }

  async #setDataSourceOpts(tenant: Tenant): Promise<void> {
    const dataSourceOpts: PostgresConnectionOptions = {
      ...tenantOrmConfig,
      host: tenant.databaseHost,
      database: this.#generateTenantDbName(tenant),
    }
    this.#dataSourceOpts = dataSourceOpts
  }

  // ...

}
                </code></pre>
                <p>
                  Como se ilustra arriba, el método <code>#generateTenantDbName</code>
                  simplemente concatena un prefijo (<code>tenant_</code>) con el
                  <code>name</code> único del tenant. El método
                  <code>#setDataSourceOpts</code> luego combina nuestra
                  <code>tenantOrmConfig</code> base con el <code>databaseHost</code>
                  específico del tenant (obtenido del plano de control) y el nombre de la
                  base de datos generado. Este objeto <code>dataSourceOpts</code> resultante
                  se asigna entonces a la propiedad privada <code>#dataSourceOpts</code> del
                  consumidor <code>TenantSetup</code>, haciéndolo disponible para el siguiente
                  paso de creación de la base de datos.
                </p>

                <p>
                  Con las opciones de <code>DataSource</code> específicas del tenant
                  configuradas en la propiedad <code>#dataSourceOpts</code>, el siguiente paso
                  crucial en el método <code>process</code> es la creación real de la base de
                  datos del tenant. Esto se maneja mediante el método auxiliar
                  <code>#createDb</code>:
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  async #createDb(tenant: Tenant): Promise<DataSource> {
    if (!this.#dataSourceOpts) throw new Error('Error creating DB')

    await this.#runInDefaultDatabase(
      "CREATE DATABASE " + this.#generateTenantDbName(tenant) + ";"
    )

    return new DataSource(this.#dataSourceOpts)
  }

  // ...

}
                </code></pre>
                <p>
                  El método <code>#createDb</code> primero verifica si las opciones
                  <code>#dataSourceOpts</code> se han inicializado correctamente. Si no es así,
                  lanza un error para evitar continuar con la creación de la base de datos.
                  Asumiendo que las opciones están disponibles, llama al método
                  <code>#runInDefaultDatabase</code>, pasando un comando SQL para crear la nueva
                  base de datos del tenant. El nombre de la base de datos se genera
                  dinámicamente utilizando el método <code>#generateTenantDbName</code>,
                  asegurando que cada tenant reciba una base de datos única. Después de
                  ejecutar el comando de creación de la base de datos, se crea una nueva
                  instancia <code>DataSource</code> de TypeORM utilizando las opciones
                  <code>#dataSourceOpts</code> configuradas previamente y se devuelve. Esta
                  <code>DataSource</code> ahora está lista para ser inicializada y utilizada
                  para ejecutar migraciones e insertar datos específicos del tenant.
                </p>
                <p>
                  <strong>Nota de seguridad importante:</strong> Tenga en cuenta que el nombre
                  del tenant, si bien se utiliza en la generación del nombre de la base de
                  datos, se sanea y valida exhaustivamente antes de ser utilizado en cualquier
                  operación de base de datos, incluido el comando
                  <code>CREATE DATABASE</code>. Esta medida de seguridad crucial previene
                  posibles vulnerabilidades de inyección SQL.
                </p>
                <p>
                  Como habrá notado, ciertas operaciones de base de datos, como el comando
                  <code>CREATE DATABASE</code>, deben ejecutarse contra la base de datos
                  PostgreSQL predeterminada (normalmente llamada <code>postgres</code>). Para
                  manejar estas operaciones, tenemos el método auxiliar
                  <code>#runInDefaultDatabase</code>:
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  async #runInDefaultDatabase(query: string) {
    try {
      throw new Error('Error running query in default database: DataSource options not initialized.')
      const defaultDbConnection = new DataSource({ ...this.#dataSourceOpts, database: 'postgres' })
      await defaultDbConnection.initialize()
      await defaultDbConnection.query(query)
      await defaultDbConnection.destroy()
    } catch (error) {
      this.logger.error({
        timestamp: +new Date(),
        data: { dataSource: this.#dataSourceOpts },
        error
      })
      throw error
    }
    return true
  }     

  // ...          

}
                </code></pre>
                <p>
                  El método <code>#runInDefaultDatabase</code> toma una consulta SQL pura como
                  entrada. Dentro de este método, primero realizamos una verificación para
                  asegurarnos de que las <code>#dataSourceOpts</code> se hayan inicializado.
                  Luego, creamos una instancia temporal de <code>DataSource</code> de TypeORM.
                  Crucialmente, tomamos una copia de las <code>#dataSourceOpts</code>
                  específicas del tenant y sobrescribimos la propiedad
                  <code>database</code> para conectarnos a la base de datos
                  <code>postgres</code> predeterminada. Esto nos permite ejecutar comandos SQL
                  a nivel administrativo que no son específicos de ninguna base de datos de
                  tenant en particular. Después de inicializar esta conexión temporal,
                  ejecutamos la <code>query</code> proporcionada. Finalmente, es esencial
                  cerrar la conexión temporal usando
                  <code>defaultDbConnection.destroy()</code> para liberar recursos y mantener
                  la higiene de la conexión. Cualquier error durante este proceso se registra
                  usando nuestro <code>Logger</code> inyectado, incluyendo una marca de tiempo y
                  la configuración <code>dataSource</code> actual para fines de depuración, y
                  luego se vuelve a lanzar para indicar un fallo.
                </p>
                <p>
                  Finalmente, examinemos el método <code>process</code>, que orquesta toda la
                  creación de la base de datos del tenant y la configuración inicial:
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  async process(job: Job<Tenant>) {
    const tenant = job.data
    this.logger.log("Processing tenant setup for:" + tenant.name + "ID:" + tenant.id)

    try {
      await this.#setDataSourceOpts(tenant)

      const tenantDataSource = await this.#createDb(tenant)
      await tenantDataSource.initialize()
      this.logger.log('Initialized database connection for tenant: ' + tenant.name)
                    
      const migrations = await tenantDataSource.runMigrations()
      this.logger.log('Ran ' + migrations.length + ' migrations for tenant:' + tenant.name)

      const tempUsers = await this.tempUsersRepository.findAll({ where: { tenant: { id: tenant.id } } })
      const usersToMigrate = tempUsers.map(({ id: _id, ...tmpUser }) => tmpUser)
      const insertResult = await tenantDataSource.manager.insert('Users', usersToMigrate)
      this.logger.log('Migrated ' + insertResult.identifiers.length + 'temporary users for tenant: ' + tenant.name)

      return usersToMigrate
    } catch (error) {
      this.logger.error("Error setting up tenant " + tenant.name + ": " + error.message, error.stack)
      throw error
    }
  }

  // ...

}
                </code></pre>
                <h4>Manejo de la configuración exitosa del tenant</h4>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  @OnWorkerEvent('completed')
  async onComplete({ data: tenant }: Job<Tenant>, result: Omit<TempUser, 'id'>[]) {
    tenant.onboardingStatus = OnboardingStates.Complete
    tenant.appAccess = true
    await this.tenantsRepository.save(tenant)
    this.tenantSetupGateway.server.emit('tenant-setup-complete', tenant.name)
    if (!!process.env.HOST && !!process.env.SCHEMA)
      result.map(async (tmpUser) => {
        const mail = generateTenantSetupCompleteEmail(
          tmpUser.email,
          process.env.SCHEMA + tenant.name + '.' + process.env.HOST
        )
        await this.emailSenderService.send(mail)
      })
  }
      
  // ...
  
}
                </code></pre>
                <p>
                  El método <code>onComplete</code> se activa cuando el método
                  <code>process</code> finaliza con éxito. Recibe los datos del
                  <code>Job</code> (la entidad <code>Tenant</code>) y el <code>result</code> (el
                  array de usuarios temporales migrados). Una vez completado con éxito, este
                  manejador realiza las siguientes acciones:
                </p>
                <ul class="sub-list">
                  <li>
                    <p>
                      Actualiza el <code>onboardingStatus</code> de la entidad
                      <code>Tenant</code> en la base de datos del plano de control a
                      <code>OnboardingStates.Complete</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      Otorga acceso a la aplicación al tenant estableciendo la propiedad
                      <code>appAccess</code> en <code>true</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      Guarda estas actualizaciones en la entidad <code>Tenant</code> utilizando
                      el <code>tenantsRepository</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      Utiliza el <code>tenantSetupGateway</code> para emitir un evento en tiempo
                      real (<code>'tenant-setup-complete'</code>) a cualquier cliente conectado,
                      notificándoles que la configuración del tenant ha finalizado.
                    </p>
                  </li>
                  <li>
                    <p>
                      Si las variables de entorno <code>HOST</code> y <code>SCHEMA</code> están
                      definidas, itera a través de los usuarios temporales migrados y les envía
                      a cada uno un correo electrónico de "configuración de tenant completa"
                      que contiene el subdominio único para su tenant.
                    </p>
                  </li>
                </ul>

                <h4>Manejo de la configuración fallida del tenant</h4>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  @OnWorkerEvent('failed')
  async onFail({ data: _tenant }: Job<Tenant>) {
    this.logger.error({
      timestamp: +new Date(),
      error: 'Something failed creating db for "data"',
      data: { datasource: this.#dataSourceOpts }
    })
    const tenant = await this.tenantsRepository.findOneBy({ id: _tenant.id })
    tenant.onboardingStatus = OnboardingStates.Error
    await this.tenantsRepository.save(tenant)
    if (this.#dataSourceOpts.database)
      await this.#runInDefaultDatabase(
        "DROP DATABASE " + this.#dataSourceOpts.database + " WITH (FORCE);"
      )
  }

  // ...

}
                </code></pre>
                <p>
                  Por el contrario, el método <code>onFail</code> se ejecuta si el método
                  <code>process</code> encuentra un error y el trabajo falla. Este manejador
                  toma los datos del <code>Job</code> fallido (la entidad
                  <code>Tenant</code>) y realiza los siguientes pasos:
                </p>
                <ul class="sub-list">
                  <li>
                    <p>
                      Registra un mensaje de error detallado, incluyendo una marca de tiempo,
                      una descripción de error genérica y las opciones
                      <code>dataSource</code> que se estaban utilizando en el momento de la
                      falla.
                    </p>
                  </li>
                  <li>
                    <p>
                      Recupera la entidad <code>Tenant</code> correspondiente de la base de
                      datos del plano de control utilizando el ID proporcionado.
                    </p>
                  </li>
                  <li>
                    <p>
                      Actualiza el <code>onboardingStatus</code> de la entidad
                      <code>Tenant</code> a <code>OnboardingStates.Error</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      Guarda este estado de error en la entidad <code>Tenant</code> utilizando
                      el <code>tenantsRepository</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      Si las <code>#dataSourceOpts</code> y su propiedad
                      <code>database</code> están definidas (lo que significa que la creación
                      de la base de datos podría haber comenzado), intenta eliminar la base de
                      datos del tenant recién creada (pero potencialmente incompleta o
                      corrupta) utilizando el método
                      <code>#runInDefaultDatabase</code> con el comando
                      <code>DROP DATABASE ... WITH (FORCE)</code>. La opción
                      <code>WITH (FORCE)</code> se utiliza para asegurar que la base de datos
                      se elimine incluso si hay conexiones activas.
                    </p>
                  </li>
                </ul>

                <p>
                  Estos manejadores de eventos son cruciales para mantener la integridad de
                  nuestro sistema multi-tenant y proporcionar una experiencia de
                  incorporación clara y receptiva para nuestros tenants. Aseguran que el
                  plano de control se actualice con el estado de la configuración del
                  tenant, se notifique a los usuarios al finalizar y las configuraciones
                  fallidas se registren y limpien adecuadamente.
                </p>
              </div>

                <div id="tenant-database-migrations" class="code-snippet">
                <h3>Migraciones de bases de datos de tenants</h3>
                <p>
                  Gestionar los cambios de esquema de la base de datos en nuestra arquitectura
                  de base de datos por tenant requiere una estrategia para garantizar la
                  consistencia en todas las bases de datos de los tenants. Para nuestro
                  plano de aplicación, hemos implementado un script que itera a través de cada
                  tenant activo y aplica cualquier migración pendiente a su base de datos
                  individual.
                </p>
                <p>
                  Cuando este script se ejecuta para el módulo <code>application</code>,
                  realiza los siguientes pasos:
                </p>
                <ul class="sub-list">
                  <li>
                    <p>Se conecta a la base de datos de control.</p>
                  </li>
                  <li>
                    <p>
                      Recupera todos los tenants con un <code>onboardingStatus</code> de
                      <code>Complete</code>.
                    </p>
                  </li>
                  <li>
                    <p>Para cada tenant activo:</p>
                    <ul class="sub-list">
                      <li>
                        <p>
                          Construye dinámicamente las opciones de conexión a la base de datos
                          utilizando el <code>databaseHost</code> específico del tenant y el
                          nombre de la base de datos generado (<code>tenant_</code> + nombre
                          del tenant).
                        </p>
                      </li>
                      <li>
                        <p>
                          Inicializa una <code>DataSource</code> de TypeORM con estas opciones.
                        </p>
                      </li>
                      <li>
                        <p>
                          Ejecuta el comando <code>runMigrations()</code> proporcionado por
                          TypeORM.
                        </p>
                      </li>
                      <li>
                        <p>Destruye la conexión <code>DataSource</code>.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      Finalmente, destruye la conexión a la base de datos de control.
                    </p>
                  </li>
                </ul>
                <pre><code class="language-typescript">
import { join } from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: join(__dirname + '../../../.env'), debug: true })
const readline = require('node:readline')
const { stdin: input, stdout: output } = require('node:process')

const SUPPORTED_MODULES: string[] = ['control', 'application']

const [_, scriptPath, ...args] = process.argv

const cdIntoScriptsPath = "cd " + scriptPath.slice(0, scriptPath.indexOf('/api/')) + "/api/scripts"

import { OnboardingStates } from '../src/control/modules/tenancy/tenants/entities/tenant.entity'
import { parseFlags, runCommand } from './helpers'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { TenantSchema } from '../src/control/modules/tenancy/tenants/schemas/tenant.schema'

class MigrationActions {
 private static errorIfModuleNameNotProvidedOrNotSupported = (moduleName?: string) => {
    if (!moduleName || !SUPPORTED_MODULES.includes(moduleName)) {
      console.error('Provide a valid module name')
      if (moduleName) console.info("Unsupported module: " + moduleName)
      console.info('Available modules are:')
      SUPPORTED_MODULES.forEach((module) => {
        console.log("- " + module)
      })
      process.exit(1)
    }
  }

  private static errorIfMigrationNameNotProvided = (migrationName?: string) => {
    if (!migrationName) {
      console.error('Provide a name for the migration')
      process.exit(1)
    }
  }
  
  public static showHelp() {
    console.info(
      'Usage: npx tsx ./scripts/scriptName migrations [flags] [action] [ generate|create|run|revert ]'
    )
    process.exit(0)
  }
 
 public static async _run([moduleName]: string[] = args) {
    MigrationActions.errorIfModuleNameNotProvidedOrNotSupported(moduleName)
    console.log('Running migrations...')
    const isAppRun = moduleName === 'application'
    if (isAppRun) {
      try {
        const ormconfig = {
          type: 'postgres' as const,
          host: process.env.ENV !== 'production' ? 'localhost' : process.env.DB_HOST,
          port: +process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          autoLoadEntities: true,
          synchronize: false,
          logging: process.env.DB_LOGGING === 'true',
          subscribers: ['dist/**/**/**/*.subscriber{.ts,.js}']
        }

        const controlOrmConfig: PostgresConnectionOptions = {
          ...ormconfig,
          entities: [
            join(__dirname, '../src/control/modules/**/schemas/*.schema{.ts,.js}')
          ],
          migrations: [join(__dirname, '../src/control/migrations/*{.ts,.js}')]
        }

        const tenantOrmConfig: PostgresConnectionOptions = {
          ...ormconfig,
          entities: [
            join(__dirname, '../src/application/modules/**/schemas/*.schema{.ts,.js}')
          ],
          migrations: [join(__dirname, '../src/application/migrations/*{.ts,.js}')]
        }

        const controlConnection = new DataSource(controlOrmConfig)
        await controlConnection.initialize()

        const tenantRepository = controlConnection.getRepository(TenantSchema)
        const tenantsWithDatabase = await tenantRepository.findBy({
          onboardingStatus: OnboardingStates.Complete
        })

        for (const tenant of tenantsWithDatabase) {
          const dataSourceOpts: PostgresConnectionOptions = {
            ...tenantOrmConfig,
            host: process.env.ENV !== 'production' ? 'localhost' : tenant.databaseHost,
            database: "tenant_" + tenant.name
          }
          const tenantDataSource = await new DataSource(dataSourceOpts).initialize()
          await tenantDataSource.runMigrations()
          await tenantDataSource.destroy()
        }
        await controlConnection.destroy()
      } catch (err) {
        console.error(err)
        throw err
      }
    } else {

      // Ejecuta las migraciones de control; hay muchas maneras de hacer esto y depende de cómo alojes tu aplicación.

    }
  }

  // Ten en cuenta que el mismo principio se utiliza para revertir migraciones; esto se omitirá aquí.

  // Además, las migraciones se generan localmente, pero podrías implementar formas más complejas de hacerlo si lo necesitaras.

  // Tenemos métodos de generación y creación, pero también se omitirán.
}

const actions = {
  generate: MigrationActions._generate,
  g: MigrationActions._generate,
  create: MigrationActions._create,
  c: MigrationActions._create,
  run: MigrationActions._run,
  revert: MigrationActions._revert
}

const { flags, newArgs } = parseFlags(args)

const action = newArgs[0]
newArgs.shift()

actions[action] ? actions[action](newArgs, flags) : MigrationActions.showHelp()

const rl = readline.createInterface({ input, output })
output.write('\n')
rl.question('Press Enter to exit \n', () => {
  rl.close()
  console.log('\nBye!\n')
  process.exit(0)
})
                </code></pre>
                <p>
                  Como se destaca en el código, cuando el módulo
                  <code>application</code> es el objetivo, establecemos una conexión con la
                  base de datos de control para obtener todos los tenants completamente
                  incorporados. Para cada uno de estos tenants, creamos dinámicamente una
                  <code>DataSource</code> de TypeORM apuntando a su base de datos específica.
                  Luego ejecutamos el comando <code>runMigrations()</code> para aplicar
                  cualquier cambio de esquema pendiente. Esto asegura que el esquema de la
                  base de datos de cada tenant se gestione de forma independiente y esté
                  actualizado.
                </p>
                <p>
                  Para gestionar las migraciones en el plano de <code>control</code>, tenemos un
                  proceso separado (cuyos detalles se omiten aquí por brevedad, pero que a menudo
                  implican el uso de la CLI de TypeORM). El mismo principio de iterar a través
                  de los tenants y aplicar cambios puede extenderse si su plano de control
                  también tiene datos específicos de tenants.
                </p>
                <p>
                  Es importante tener en cuenta que la lógica para revertir migraciones y
                  generar nuevas sigue un patrón similar, pero no se incluye en este ejemplo
                  simplificado. En nuestro flujo de trabajo, las migraciones se generan
                  típicamente de forma local durante el desarrollo.
                </p>
                <p>
                  También vale la pena señalar que el método _run puede extenderse fácilmente
                  para admitir un control más granular sobre qué tenants reciben
                  migraciones. Por ejemplo, podría agregar indicadores o argumentos al script
                  para filtrar tenants según su ID, estado u otros criterios, aunque este
                  nivel de especificidad no era un requisito para nuestra implementación
                  inicial.
                </p>
                <p>
                  <strong>Configuración del entorno:</strong>
                </p>
                <p>
                  El script de migración se basa en variables de entorno (cargadas usando
                  <code>dotenv</code>) para establecer conexiones tanto con la base de datos de
                  control como con las bases de datos de tenants individuales.
                  <strong>Por lo tanto, es primordial configurar estas variables con precisión
                    para cada entorno (desarrollo, pruebas, staging, producción).</strong> Esto
                  incluye detalles como los hosts de la base de datos, puertos, nombres de
                  usuario y contraseñas. Las configuraciones inconsistentes o incorrectas
                  pueden resultar en migraciones fallidas o modificaciones de datos no
                  deseadas.
                </p>
                </div>
                </div>
                <div id="closing-thoughts">
                  <h1>Consideraciones finales</h1>
                  <p>
                    Implementar una aplicación robusta de Software como Servicio (SaaS) multi-tenant
                    presenta un conjunto fascinante de desafíos arquitectónicos. Como hemos
                    explorado en esta publicación, nuestra decisión de adoptar una estrategia de
                    base de datos por tenant, implementada con la potencia de NestJS, ofrece
                    ventajas significativas en términos de aislamiento de datos del tenant y el
                    potencial para una escalabilidad granular. La perfecta integración de TypeORM
                    con PostgreSQL ha sido fundamental para gestionar nuestras interacciones con
                    la base de datos y garantizar la integridad de los datos entre tenants. Sin
                    embargo, es crucial reconocer que este enfoque no está exento de sus
                    complejidades y compensaciones. La gestión de un mayor número de bases de
                    datos puede aumentar la sobrecarga operativa, incluyendo copias de seguridad,
                    mantenimiento y el posible consumo de recursos. La configuración inicial y la
                    incorporación de tenants requieren una orquestación cuidadosa, como lo
                    demuestra nuestra implementación asíncrona basada en colas utilizando BullMQ.
                    Además, las consultas y análisis entre tenants pueden volverse más
                    intrincados, lo que a menudo requiere mecanismos de consulta distribuidos o
                    estrategias de agregación de datos. El panorama de la multitenencia es amplio,
                    con varios patrones y consideraciones que van más allá del alcance de esta
                    única publicación. Le animamos a ver nuestra implementación como un punto de
                    partida y a explorar otras estrategias que puedan adaptarse mejor a los
                    requisitos y la escala específicos de su aplicación. Conceptos como bases de
                    datos compartidas con identificadores de tenant, aislamiento basado en
                    esquemas e incluso técnicas más avanzadas como la fragmentación de datos
                    ofrecen rutas alternativas que vale la pena investigar. Para profundizar en
                    su comprensión de las tecnologías y conceptos discutidos, le recomendamos
                    encarecidamente que explore la documentación oficial de
                    <a href="https://docs.nestjs.com/">NestJS</a> y
                    <a href="https://orkhan.gitbook.io/typeorm/docs">TypeORM</a>. Además, el libro
                    de Tod Golding, "Building Multi-tenant SaaS Architectures", proporciona una
                    base teórica más amplia para la arquitectura SaaS y los patrones de
                    multitenencia. La
                    <a
                      href="https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/"
                      >publicación del blog de Thomas Vanderstraeten</a
                    >
                    ofrece una valiosa perspectiva complementaria sobre el aislamiento de tenants
                    a nivel de base de datos. Esperamos que esta exploración detallada de nuestra
                    implementación de base de datos por tenant le haya proporcionado
                    conocimientos prácticos y una base sólida para su propio viaje multi-tenant.
                    Gracias por tomarse el tiempo de profundizar en nuestro enfoque.
                  </p>
            </div>
          </div>
          `;

const enPostContent = String.raw`<p>
            This is heavily inspired by <a
              href="https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/"
              target="_blank"
              rel="noopener noreferrer">Thomas Vanderstraeten' s take</a
            >
          </p>
          <section id="table-of-contents">
            <h1>Table of contents</h1>
            <ul class="sub-list">
              <li>
                <a href="#introduction">Introduction</a>
              </li>
              <li>
                <a href="#inspired-by">Inspired By</a>
              </li>
              <li>
                <a href="#shift-rationale">Rationale</a>
              </li>
              <li>
                <a href="#implementation-details">Implementation Details</a>
              </li>
              <li>
                <a href="#code-snippets">Code Snippets</a>
                <ul class="sub-list">
                  <li><a href="#middleware">Middleware</a></li>
                  <li><a href="#repositories">Repositories</a></li>
                  <li>
                    <a href="#tenant-connections-management"
                      >Tenant Connections Management</a
                    >
                  </li>
                  <li>
                    <a href="#tenant-database-creation"
                      >Tenant Database Creation</a
                    >
                  </li>
                  <li>
                    <a href="#tenant-database-migration"
                      >Tenant Database Migration</a
                    >
                  </li>
                </ul>
              </li>
              <li>
                <a href="#closing-thoughts">Closing Thoughts</a>
              </li>
              <li>
                <a href="#comment-section">Comments</a>
              </li>
            </ul>
          </section>
          <div class="post-content">
            <div id="introduction">
            <h1>Introduction</h1>
              <p>
                In building our SaaS construction management platform, we faced
                the critical challenge of implementing multitenancy to ensure
                data isolation and a tailored experience for each client.
                Initially inspired by Thomas Vanderstraeten's excellent blog
                post on schema-based multitenancy with NestJS, TypeORM, and
                PostgreSQL, our approach evolved significantly to leverage a
                database-per-tenant architecture. This post outlines our journey
                and the rationale behind this shift, detailing how we
                implemented robust tenant isolation using dedicated database
                instances.
              </p>
            </div>
            <div id="inspired-by">
              <h1>Inspired by</h1>
              <p>
                Thomas Vanderstraeten's article provided a valuable foundation
                for understanding the core principles of multitenancy within the
                NestJS ecosystem. His exploration of schema-based isolation
                highlighted key considerations like tenant identification and
                connection management. While we initially considered this
                approach, our specific requirements for enhanced isolation and
                scalability led us down a different path. The fundamental
                concepts and considerations discussed in his post will not be
                repeated here, as we will focus on our distinct implementation.
              </p>
              <p>
                It's also important to acknowledge the significant influence of
                Tod Golding's insightful book, "Building Multi-tenant SaaS
                Architectures" on our architectural decisions. In particular,
                the separation of concerns and the concepts of a control plane
                and application plane, which we will elaborate on later, were
                heavily inspired by the valuable framework provided in his book
                for building robust multitenant systems.
              </p>
            </div>
            <div id="shift-rationale">
              <h1>Rationale</h1>
              <p>
                Our decision to move away from shared schemas to individual
                database instances for each tenant was driven by several
                factors:
              </p>
              <ul>
                <li>
                  <p>
                    <strong>Enhanced Data Isolation:</strong> Complete separation
                    at the database level provides the strongest guarantee of data
                    privacy and security for each tenant.
                  </p>
                </li>
                <li>
                  <p>
                    <strong>Scalability and Performance: </strong>
                    Isolating tenants in their own databases can lead to better performance
                    and scalability, as database operations are scoped to a single
                    tenant's data.
                  </p>
                </li>
                <li>
                  <p>
                    <strong> Customization and Flexibility: </strong>
                    Individual databases allow for greater flexibility in terms of
                    tenant-specific database configurations, extensions, and even
                    potentially different database versions in the future.
                  </p>
                </li>
                <li>
                  <p>
                    <strong> Simplified Backups and Restores: </strong>
                    Managing backups and restores becomes simpler and more granular
                    when each tenant has its own database.
                  </p>
                </li>
              </ul>
            </div>
            <div id="implementation-details">
              <h2>
                How we implemented a database-per-tenant solution in our NestJS application
              </h2>
              <ul>
                <li>
                <p>
                  <strong>Tenant identification:</strong> Following the principles
                  outlined in Vanderstraeten's post, we implemented a subdomain-based
                  approach for tenant identification. Instead of a system-assigned
                  identifier, each tenant chooses a unique name which then becomes
                  their dedicated subdomain (e.g., tenantchosenname.mysaas.com).
                  This chosen identifier is parsed from the request's origin, serving
                  as the key to establish a dedicated database connection for that
                  specific tenant. It's crucial to emphasize that these tenant-chosen
                  subdomain names undergo rigorous sanitization to ensure security
                  and prevent any potential vulnerabilities.
                </p>
              </li>
              <li>
                <p>
                  <strong>Dynamic Database Connections:</strong> For this we implemented
                  a system to establish and manage connections to separate postgres
                  database instances at runtime
                </p>
                <ul class="sub-list">
                  <li>
                    <p>
                      To handle connections to individual tenant databases, we
                      employed a hybrid approach for storing connection details.
                      While certain fundamental parameters like the database
                      host were stored within our central database, the
                      remaining necessary connection configurations were managed
                      through a centralized configuration object, leveraging
                      environment variables.
                    </p>
                  </li>
                  <li>
                    <p>
                      The process of creating and retrieving tenant-specific
                      database connections was orchestrated using a singleton
                      pattern. This ensured that database connections were
                      lazily retrieved: either by accessing an existing
                      connection stored in an internal Map within the singleton
                      instance or by dynamically establishing a new connection
                      when one didn't already exist. Newly created connections
                      were then stored in a Map for subsequent reuse. This
                      entire process was managed by a middleware. This
                      middleware played a crucial role in intercepting each
                      request, identifying the tenant, and attaching the
                      corresponding DataSource to the request object. This
                      attached data source was then readily available for the
                      dynamic creation of request-scoped repositories, ensuring
                      that all data access operations were directed to the
                      correct tenant's database.
                    </p>
                  </li>
                </ul>
              </li>
              <li>
                <p>
                  <strong>Tenant database creation: </strong> To handle the creation
                  of new tenant databases, we implemented an asynchronous process
                  leveraging NestJS's Queues module (@nestjs/bullmq, BullMQ). Upon
                  completion of a new tenant's onboarding process, a job was added
                  to the queue to initiate database setup. A dedicated consumer or
                  processor then retrieved all necessary tenant information and established
                  a temporary connection to the default "postgres" database. This
                  connection was used to execute a database creation query for the
                  new tenant. Subsequently, the processor would run all necessary
                  database migrations, migrate any relevant temporary data, and finally
                  update our tenants table with the new database connection details.
                  This asynchronous approach ensured that the database creation process
                  didn't block the onboarding flow, providing a smoother user experience.
                </p>
              </li>
              <li>
                <p>
                  <strong>Tenant database migration: </strong> To manage database
                  schema updates across all tenants, we developed a dedicated TypeScript
                  script. This script, executed using tsx, initiated the migration
                  process by first establishing a new DataSource connection to our
                  tenants table. It then queried this table to retrieve a list of
                  all active tenants. For each tenant identified, the script dynamically
                  constructed a new DataSource connection using the tenant-specific
                  parameters stored in the registry and our environment variables.
                  With these tenant-specific connections established, the script
                  then ran the necessary database migrations for each individual
                  tenant, ensuring their schema was up-to-date. Furthermore, this
                  script was designed to be flexible, accepting numbered arguments
                  via the command-line interface (CLI) to allow for targeted migration
                  runs on specific tenants, providing granular control over the update
                  process.
                </p>
              </li>
              <li>
                <p>
                  <strong>Data access layer:</strong> Our Data Access Layer (DAL)
                  was designed with a strong emphasis on decoupling our core application
                  logic from the complexities of multitenancy. To achieve this, our
                  repositories and services remain blissfully unaware of the underlying
                  tenant context. This separation of concerns was facilitated by
                  a strategic use of middleware and a dedicated connection management
                  service. This was done through: Middleware for DataSource injection,
                  Singleton connection management service, Tenant-oblivious services
                  and repositories
                </p>
                <p>This design pattern provided several key benefits:</p>
                <ul class="sub-list">
                  <li>
                    <p>
                      <strong> Clean Code: </strong>
                      Our core business logic remained focused on its primary responsibilities,
                      without being cluttered with tenancy-specific code.
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong> Maintainability: </strong>
                      Changes to the multitenancy implementation (e.g., how tenants
                      are identified or how connections are managed) could be made
                      within the middleware and the connection management service
                      without requiring modifications to the repositories or services.
                    </p>
                  </li>
                  <li>
                    <p>
                      <strong> Testability: </strong>
                      Testing our services and repositories became simpler as we
                      could easily mock the injected DataSource without needing to
                      simulate the entire tenancy context.
                    </p>
                  </li>
                </ul>
              </li>
              </ul>
            </div>
            <div id="code-snippets">
              <h2>Code examples</h2>
              <div id="#middleware" class="code-snippet">
                <p>
                  To initiate the dynamic tenant connection process, we
                  implemented a NestJS middleware. This middleware, as
                  illustrated in the code snippet below, plays a crucial role in
                  identifying the tenant based on the incoming request and
                  making the corresponding database connection available for
                  subsequent data access. While the code also includes the
                  attachment of an <code>ENTITY_MANAGER_KEY</code> for transactional
                  management, we will focus here on the core logic of tenant connection.
                </p>
                <pre><code class="language-typescript">import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { TenantConnectionsService } from '@/application/modules/common/tenant-connections.service'
import { ENTITY_MANAGER_KEY } from './tenant-transactions.interceptor'

export const TENANT_QUERY_RUNNER = 'tenant-query-runner'

@Injectable()
export class TenantConnectionMiddleware implements NestMiddleware {
  constructor(private readonly tenantConnectionsService: TenantConnectionsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const protocol = process.env.PROTOCOL
    const host = process.env.HOST

    // Here you only want to escape the literal dot, I ran into some trouble trying to display this code

    const originPartsToRemove: RegExp = new RegExp(String.raw\`\${protocol}|$\{host}|\\.\`, 'g')
    const tenantIdentifier: string = req.headers.origin.replaceAll(originPartsToRemove, '')

    const tenantQueryRunner = (
      await this.tenantConnectionsService.get(tenantIdentifier)
    ).createQueryRunner()

    req[TENANT_QUERY_RUNNER] = tenantQueryRunner

    req[ENTITY_MANAGER_KEY] = tenantQueryRunner.manager

    next()
  }
}</code></pre>
                <p>
                  Let's delve into the functionality of this middleware.
                  Leveraging NestJS's dependency injection, we inject the <code
                    >TenantConnectionsService</code
                  >, which is responsible for managing and retrieving
                  tenant-specific database connections. Within the <code
                    >use</code
                  > method, the core logic resides. First, for clarity and convenience,
                  we assign the <code>PROTOCOL</code> and <code>HOST</code> environment
                  variables to local constants. Next, we define the <code
                    >originPartsToRemove</code
                  > Regular Expression. This expression is constructed to match the
                  protocol (e.g., <code>http://</code> or <code>https://</code
                  >), the main host of our application, and any literal dots. By
                  replacing these matched parts from the request's <code
                    >origin</code
                  > header, we effectively isolate the <code
                    >tenantIdentifier</code
                  >, which, as established earlier, corresponds to the unique
                  subdomain chosen by the tenant.
                </p>
                <p>
                  With the <code>tenantIdentifier</code> extracted, we then utilize
                  the <code>TenantConnectionsService</code>'s <code>get</code> method
                  to retrieve the appropriate DataSource for that specific tenant.
                  Subsequently, we create a QueryRunner from this DataSource. This
                  <code>tenantQueryRunner</code> is then attached to the request
                  object using the <code>TENANT_QUERY_RUNNER</code> key, making it
                  available for subsequent operations. Additionally, we also attach
                  the QueryRunner's
                  <code>manager</code> (the EntityManager) to the request, which
                  is used for retrieving entity repositories within the request lifecycle.
                </p>
              </div>
              <div id="#repositories" class="code-snippet">
                <h3>Repositories</h3>
                <p>
                  Next, let's examine how the tenant-specific <code
                    >EntityManager</code
                  >, attached to the request by our middleware, is utilized
                  within our data access layer. To streamline repository
                  creation and avoid repetitive code across our entity-specific
                  repositories, we implemented an extendable <code
                    >BaseRepository</code
                  > class. This base class encapsulates the logic for retrieving
                  the appropriate TypeORM <code>Repository</code> instance using
                  the request's <code>EntityManager</code>. Here's the
                  implementation of our <code>BaseRepository</code>:
                </p>
                <pre><code class="language-typescript">
import { EntityManager, EntitySchema, ObjectLiteral, Repository } from 'typeorm';
import { ENTITY_MANAGER_KEY } from './tenant-transactions.interceptor';
import { Request } from 'express';

export class BaseRepository {
  constructor(private request: Request & { [ENTITY_MANAGER_KEY]: EntityManager }) {}

  protected getRepository<T extends ObjectLiteral>(
    entityCls: EntitySchema
  ): Repository<T> {
    const entityManager: EntityManager = this.request[ENTITY_MANAGER_KEY];

    if (!entityManager) {
      throw new Error('No EntityManager found on the request.');
    }

    return entityManager.getRepository(entityCls);
  }
}
                </code></pre>
                <p>
                  As you can see in the <code>BaseRepository</code>, the
                  constructor receives the request object, which we've augmented
                  to include the <code>EntityManager</code> under the <code
                    >ENTITY_MANAGER_KEY</code
                  >. The protected <code>getRepository</code> method then accesses
                  this <code>EntityManager</code> from the request and uses it to
                  retrieve the TypeORM <code>Repository</code> for a given entity
                  schema. This ensures that each repository instance operates within
                  the context of the current tenant's database connection.
                </p>
                <p>
                  Concrete repositories within our application then extend this <code
                    >BaseRepository</code
                  > and, by leveraging the <code>getRepository</code> method, gain
                  access to the correctly scoped entity repository. Here's an example
                  of how an <code>ExampleRepository</code> would be implemented:
                </p>
                <pre><code class="language-typescript">
import { Injectable, Scope, Repository } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '../base.repository';
import { ExampleEntity } from './example.entity';
import { ExampleEntitySchema } from './example.schema';
import { ENTITY_MANAGER_KEY } from '../tenant-transactions.interceptor';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ExampleRepository extends BaseRepository {
  private repository: Repository<ExampleEntity>;

  constructor(@Inject(REQUEST) private readonly req: Request & { [ENTITY_MANAGER_KEY]: EntityManager }) {
    super(req);
    this.repository = this.getRepository(ExampleEntitySchema);
  }

  // Rest of the repository methods (e.g., findOne, find, save, etc.)

}
                </code></pre>
                <p>
                  In this <code>ExampleRepository</code>, we first define its
                  scope as <code>REQUEST</code>, ensuring a new instance is
                  created for each incoming request. By extending <code
                    >BaseRepository</code
                  > and calling the <code>getRepository</code> method within its
                  constructor, we obtain the tenant-specific repository for the <code
                    >ExampleEntity</code
                  >. This elegantly abstracts away the underlying tenancy
                  management, allowing our repositories to focus solely on data
                  access concerns within the correct tenant's context. While the
                  term "repository" is indeed mentioned frequently, this pattern
                  proved to be the most straightforward and maintainable
                  solution for ensuring proper data isolation in our
                  multi-tenant architecture.
                </p>
              </div>
              <div id="#tenant-connections-management" class="code-snippet">
                <h3>Tenant Connections Management</h3>
                <p>
                  To centralize the management and retrieval of tenant-specific
                  database connections, we implemented a dedicated <code
                    >TenantConnectionsService</code
                  >. Given the singleton nature of NestJS services within their
                  defined scope, this approach ensures that connection
                  management logic is handled consistently and efficiently
                  across the application. This design simplifies future
                  modifications or enhancements to our connection retrieval
                  process. Let's examine the implementation:
                </p>
                <pre><code class="language-typescript">
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { join } from 'path';

import { connectionSource as controlDataSource } from '@/config/db/control-orm.config';
import { TenantSchema } from '@/control/modules/tenancy/tenants/schemas/tenant.schema';
import { Tenant } from '@/control/modules/tenancy/tenants/entities/tenant.entity';
import { tenantOrmConfig } from '@/config/db/application-orm.config';

@Injectable()
export class TenantConnectionsService {
  readonly #tenantConnections: Map<string, DataSource> = new Map();

  constructor() {}

  #generateTenantDbName(tenant: Tenant) {
    return "tenant_" + tenant.name
  }

  async #initializeDataSource(dataSource: DataSource): Promise<DataSource> {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    return dataSource;
  }

  async get(name: string): Promise<DataSource> {
    const cachedDataSource = this.#tenantConnections.get(name);
    if (cachedDataSource) {
      return await this.#initializeDataSource(cachedDataSource);
    }

    if (!controlDataSource.isInitialized) {
      await controlDataSource.initialize();
    }

    const tenant = await controlDataSource.getRepository(TenantSchema).findOneBy({ name });

    if (!tenant) throw new Error('Could not find tenant ' + name)

    const dataSourceOptions: PostgresConnectionOptions = {
      ...tenantOrmConfig,
      host: tenant.databaseHost,
      database: this.#generateTenantDbName(tenant),
      entities: [join(__dirname, '../../**/*.schema{.js,.ts}')],
    };

    const newDataSource = new DataSource(dataSourceOptions);
    this.#tenantConnections.set(tenant.name, newDataSource);
    return await this.#initializeDataSource(newDataSource);
  }
}
                </code></pre>
                <p>
                  This <code>TenantConnectionsService</code> maintains a <code
                    >Map</code
                  > called <code>#tenantConnections</code>, which serves as a
                  cache to store tenant-specific <code>DataSource</code> instances,
                  keyed by the tenant's unique identifier (<code>name</code>).
                  The <code>get</code> method is the primary interface for retrieving
                  a <code>DataSource</code> for a given tenant. It first checks if
                  a <code>DataSource</code> for the requested tenant <code
                    >name</code
                  > exists in the cache. If found, it returns the (potentially already
                  initialized) instance after ensuring it's initialized.
                </p>
                <p>
                  If a <code>DataSource</code> for the tenant is not found in the
                  cache, the service then interacts with our central "control" database
                  (using <code>controlDataSource</code>) to fetch the <code
                    >Tenant</code
                  > entity based on the provided <code>name</code>. We
                  intentionally store only the tenant's database host in this
                  central database, opting for a more streamlined approach,
                  although other connection parameters could be stored here for
                  greater flexibility if needed. The tenant's actual database
                  name is dynamically generated using the <code
                    >#generateTenantDbName</code
                  > method.
                </p>
                <p>
                  Once the <code>Tenant</code> entity is retrieved, we construct
                  the <code>PostgresConnectionOptions</code> for the tenant's database
                  by merging our base <code>tenantOrmConfig</code> with the tenant-specific
                  <code>databaseHost</code> and the dynamically generated database
                  name. Importantly, the <code>entities</code> path is configured
                  to point to the compiled schema files within the application plane,
                  ensuring TypeORM can correctly map entities to the tenant's database.
                  Finally, a new <code>DataSource</code> instance is created using
                  these options, stored in the <code>#tenantConnections</code> map
                  for future use, initialized, and then returned. The <code
                    >#initializeDataSource</code
                  > method ensures that the <code>DataSource</code> is initialized
                  only once, even if the <code>get</code> method is called multiple
                  times for the same tenant.
                </p>
              </div>
              <div id="#tenant-database-creation" class="code-snippet">
                <h3>Tenant Database Creation</h3>
                <p>
                  We'll approach the explanation of tenant database creation
                  differently, focusing on the asynchronous nature of the
                  process. As highlighted in Tod Golding's "Building
                  Multi-tenant SaaS Architectures," a seamless and user-friendly
                  onboarding experience is paramount. With this in mind, our
                  onboarding flow in the control plane allows tenants to provide
                  information incrementally and even leave and return later.
                  During this phase, a tenant record is created in our control
                  database but isn't immediately associated with a dedicated
                  application database or subdomain. These are provisioned later
                  through an update process. While this introduces a slight
                  delay between initial signup and full tenant activation, it
                  underscores the flexibility of our system, allowing database
                  creation to occur as soon as the necessary information is
                  available or after a more extended onboarding journey.
                </p>
                <p>
                  So, let's examine the initial setup of the queue consumer
                  responsible for this process:
                </p>
                <pre><code class="language-typescript">
import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import { TENANT_SETUP_KEY } from './constants'
import { TenantsRepository } from '@/control/modules/tenancy/tenants/repositories/tenants.repository'
import { TempUsersRepository } from '@/control/modules/onboarding/repositories/temp-users.repository'
import { EmailSenderService } from '@/application/modules/common/email/email-sender.service'
import { TenantSetupGateway } from '@/application/gateways/tenant-setup.gateway'

@Processor(TENANT_SETUP_KEY)
@Injectable()
export class TenantSetup extends WorkerHost {
  #dataSourceOpts: PostgresConnectionOptions | null = null // Explained later

  constructor(
    private readonly tenantsRepository: TenantsRepository,

    // This "TempUsers" repository handles users created during onboarding.

    // Our migration process will transfer these users to the tenant's dedicated database.

    private readonly tempUsersRepository: TempUsersRepository,
    private readonly logger: Logger = new Logger(TenantSetup.name),
    private readonly emailSenderService: EmailSenderService,
    private readonly tenantSetupGateway: TenantSetupGateway
  ) {
    super()
  }

  // ...

}
                </code></pre>
                <p>
                  Here, we define <code>TenantSetup</code> as a NestJS <a
                    href="https://docs.nestjs.com/techniques/queues#consumers"
                    target="_blank"
                    rel="noopener noreferrer">Consumer</a
                  >, decorated with <code>@Processor(TENANT_SETUP_KEY)</code>.
                  This decorator instructs BullMQ to listen for jobs with the
                  identifier <code>TENANT_SETUP_KEY</code>. The constructor of
                  this consumer injects several dependencies that will be
                  utilized during the tenant database creation process. Notably,
                  these include repositories for accessing tenant and temporary
                  user data in the control plane, a logger for operational
                  insights, an <code>EmailSenderService</code> for potential notifications,
                  and a <code>TenantSetupGateway</code>. While the <code
                    >Logger</code
                  >, <code>EmailSenderService</code>, and <code
                    >TenantSetupGateway</code
                  > are specific to our implementation for enhanced logging and a
                  seamless onboarding experience, the core logic for database creation
                  revolves around the repository interactions. The <code
                    >#dataSourceOpts</code
                  > private property, which we'll explain below, will hold the configuration
                  for the new tenant's database connection.
                </p>
                <h4>Core</h4>
                <p>
                  As we saw in the <code>TenantSetup</code> consumer, the <code
                    >process</code
                  > method orchestrates the creation of a new tenant database. This
                  involves several helper methods within the consumer. Let's begin
                  by examining the configuration of the tenant-specific <code
                    >DataSource</code
                  > options:
                </p>
                <p>
                  The <code>#setDataSourceOpts</code> method is responsible for constructing
                  the necessary configuration object for connecting to the new tenant's
                  database. This method leverages the base <code
                    >tenantOrmConfig</code
                  >, which is a <code>PostgresConnectionOptions</code> object imported
                  from TypeORM. This base configuration typically includes connection
                  parameters defined through environment variables and general application
                  settings. We then override specific options with tenant-specific
                  information retrieved from our control plane database. We also
                  utilize the <code>#generateTenantDbName</code> method to set a
                  database name for each tenant.
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  #generateTenantDbName(tenant: Tenant): string {
    return "tenant_" + tenant.name
  }

  async #setDataSourceOpts(tenant: Tenant): Promise<void> {
    const dataSourceOpts: PostgresConnectionOptions = {
      ...tenantOrmConfig,
      host: tenant.databaseHost,
      database: this.#generateTenantDbName(tenant),
    }
    this.#dataSourceOpts = dataSourceOpts
  }

  // ...

}
                </code></pre>
                <p>
                  As illustrated above, the <code>#generateTenantDbName</code> method
                  simply concatenates a prefix (<code>tenant_</code>) with the
                  tenant's unique <code>name</code>. The <code
                    >#setDataSourceOpts</code
                  > method then combines our base
                  <code>tenantOrmConfig</code> with the <code>databaseHost</code
                  > specific to the tenant (obtained from the control plane) and
                  the generated database name. This resulting <code
                    >dataSourceOpts</code
                  > object is then assigned to the private <code
                    >#dataSourceOpts</code
                  > property of the <code>TenantSetup</code> consumer, making it
                  available for the subsequent database creation step.
                </p>

                <p>
                  With the tenant-specific <code>DataSource</code> options configured
                  in the <code>#dataSourceOpts</code> property, the next crucial
                  step in the <code>process</code> method is the actual creation
                  of the tenant's database. This is handled by the <code
                    >#createDb</code
                  > helper method:
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  async #createDb(tenant: Tenant): Promise<DataSource> {
    if (!this.#dataSourceOpts) throw new Error('Error creating DB')

    await this.#runInDefaultDatabase(
      "CREATE DATABASE " + this.#generateTenantDbName(tenant) + ";"
    )

    return new DataSource(this.#dataSourceOpts)
  }

  // ...

}
                </code></pre>
                <p>
                  The <code>#createDb</code> method first checks if the <code
                    >#dataSourceOpts</code
                  > have been properly initialized. If not, it throws an error to
                  prevent proceeding with database creation. Assuming the options
                  are available, it then calls the <code
                    >#runInDefaultDatabase</code
                  > method, passing a SQL command to create the new tenant database.
                  The database name is dynamically generated using the <code
                    >#generateTenantDbName</code
                  > method, ensuring each tenant receives a unique database. After
                  the database creation command is executed, a new TypeORM <code
                    >DataSource</code
                  > instance is created using the previously configured <code
                    >#dataSourceOpts</code
                  > and returned. This <code>DataSource</code> is now ready to be
                  initialized and used for running migrations and inserting tenant-specific
                  data.
                </p>
                <p>
                  <strong>Important Security Note:</strong> Please be aware that
                  the tenant name, while used in the database name generation, is
                  thoroughly sanitized and validated before being used in any database
                  operations, including the <code>CREATE DATABASE</code> command.
                  This crucial security measure prevents potential SQL injection
                  vulnerabilities.
                </p>
                <p>
                  As you might have noticed, certain database operations, such
                  as the <code>CREATE DATABASE</code> command, need to be executed
                  against the default PostgreSQL database (typically named <code
                    >postgres</code
                  >). To handle these operations, we have the <code
                    >#runInDefaultDatabase</code
                  > helper method:
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  async #runInDefaultDatabase(query: string) {
    try {
      throw new Error('Error running query in default database: DataSource options not initialized.')
      const defaultDbConnection = new DataSource({ ...this.#dataSourceOpts, database: 'postgres' })
      await defaultDbConnection.initialize()
      await defaultDbConnection.query(query)
      await defaultDbConnection.destroy()
    } catch (error) {
      this.logger.error({
        timestamp: +new Date(),
        data: { dataSource: this.#dataSourceOpts },
        error
      })
      throw error
    }
    return true
  }     

  // ...          

}
                </code></pre>
                <p>
                  The <code>#runInDefaultDatabase</code> method takes a raw SQL query
                  as input. Within this method, we first perform a check to ensure
                  that the <code>#dataSourceOpts</code> have been initialized. Then,
                  we create a temporary TypeORM <code>DataSource</code> instance.
                  Crucially, we take a copy of the tenant-specific <code
                    >#dataSourceOpts</code
                  > and override the <code>database</code> property to connect to
                  the default <code>postgres</code> database. This allows us to execute
                  administrative-level SQL commands that are not specific to any
                  particular tenant database. After initializing this temporary connection,
                  we execute the provided <code>query</code>. Finally, it's
                  essential to close the temporary connection using <code
                    >defaultDbConnection.destroy()</code
                  > to release resources and maintain connection hygiene. Any errors
                  during this process are logged using our injected <code
                    >Logger</code
                  >, including a timestamp and the current <code
                    >dataSource</code
                  > configuration for debugging purposes, and then re-thrown to indicate
                  failure.
                </p>
                <p>
                  Finally, let's examine the <code>process</code> method, which orchestrates
                  the entire tenant database creation and initial setup:
                </p>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  async process(job: Job<Tenant>) {
    const tenant = job.data
    this.logger.log("Processing tenant setup for:" + tenant.name + "ID:" + tenant.id)

    try {
      await this.#setDataSourceOpts(tenant)

      const tenantDataSource = await this.#createDb(tenant)
      await tenantDataSource.initialize()
      this.logger.log('Initialized database connection for tenant: ' + tenant.name)
                    
      const migrations = await tenantDataSource.runMigrations()
      this.logger.log('Ran ' + migrations.length + ' migrations for tenant:' + tenant.name)

      const tempUsers = await this.tempUsersRepository.findAll({ where: { tenant: { id: tenant.id } } })
      const usersToMigrate = tempUsers.map(({ id: _id, ...tmpUser }) => tmpUser)
      const insertResult = await tenantDataSource.manager.insert('Users', usersToMigrate)
      this.logger.log('Migrated ' + insertResult.identifiers.length + 'temporary users for tenant: ' + tenant.name)

      return usersToMigrate
    } catch (error) {
      this.logger.error("Error setting up tenant " + tenant.name + ": " + error.message, error.stack)
      throw error
    }
  }

  // ...

}
                </code></pre>
                <h4>Handling Successful Tenant Setup</h4>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  @OnWorkerEvent('completed')
  async onComplete({ data: tenant }: Job<Tenant>, result: Omit<TempUser, 'id'>[]) {
    tenant.onboardingStatus = OnboardingStates.Complete
    tenant.appAccess = true
    await this.tenantsRepository.save(tenant)
    this.tenantSetupGateway.server.emit('tenant-setup-complete', tenant.name)
    if (!!process.env.HOST && !!process.env.SCHEMA)
      result.map(async (tmpUser) => {
        const mail = generateTenantSetupCompleteEmail(
          tmpUser.email,
          process.env.SCHEMA + tenant.name + '.' + process.env.HOST
        )
        await this.emailSenderService.send(mail)
      })
  }
      
  // ...
  
}
                </code></pre>
                <p>
                  The <code>onComplete</code> method is triggered when the <code
                    >process</code
                  > method completes successfully. It receives the <code
                    >Job</code
                  > data (the <code>Tenant</code> entity) and the <code
                    >result</code
                  > (the array of migrated temporary users). Upon successful completion,
                  this handler performs the following actions:
                </p>
                <ul class="sub-list">
                  <li>
                    <p>
                      It updates the <code>onboardingStatus</code> of the <code
                        >Tenant</code
                      > entity in the control plane database to <code
                        >OnboardingStates.Complete</code
                      >.
                    </p>
                  </li>
                  <li>
                    <p>
                      It grants application access to the tenant by setting the <code
                        >appAccess</code
                      > property to <code>true</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      It saves these updates to the <code>Tenant</code> entity using
                      the <code>tenantsRepository</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      It uses the <code>tenantSetupGateway</code> to emit a real-time
                      event (<code>'tenant-setup-complete'</code>) to any
                      connected clients, notifying them that the tenant setup is
                      finished.
                    </p>
                  </li>
                  <li>
                    <p>
                      If the <code>HOST</code> and <code>SCHEMA</code> environment
                      variables are defined, it iterates through the migrated temporary
                      users and sends each of them a "tenant setup complete" email
                      containing the unique subdomain
                      for their tenant.
                    </p>
                  </li>
                </ul>

                <h4>Handling Failed Tenant Setup</h4>
                <pre><code class="language-typescript">
export class TenantSetup extends WorkerHost {

  // ...

  @OnWorkerEvent('failed')
  async onFail({ data: _tenant }: Job<Tenant>) {
    this.logger.error({
      timestamp: +new Date(),
      error: 'Something failed creating db for "data"',
      data: { datasource: this.#dataSourceOpts }
    })
    const tenant = await this.tenantsRepository.findOneBy({ id: _tenant.id })
    tenant.onboardingStatus = OnboardingStates.Error
    await this.tenantsRepository.save(tenant)
    if (this.#dataSourceOpts.database)
      await this.#runInDefaultDatabase(
        "DROP DATABASE " + this.#dataSourceOpts.database + " WITH (FORCE);"
      )
  }

  // ...

}
                </code></pre>
                <p>
                  Conversely, the <code>onFail</code> method is executed if the <code
                    >process</code
                  > method encounters an error and the job fails. This handler takes
                  the failed <code>Job</code> data (the <code>Tenant</code> entity)
                  and performs the following steps:
                </p>
                <ul class="sub-list">
                  <li>
                    <p>
                      It logs a detailed error message, including a timestamp, a
                      generic error description, and the <code>dataSource</code>
                      options that were being used at the time of the failure.
                    </p>
                  </li>
                  <li>
                    <p>
                      It retrieves the corresponding <code>Tenant</code> entity from
                      the control plane database using the provided ID.
                    </p>
                  </li>
                  <li>
                    <p>
                      It updates the <code>onboardingStatus</code> of the <code
                        >Tenant</code
                      > entity to <code>OnboardingStates.Error</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      It saves this error status to the <code>Tenant</code> entity
                      using the <code>tenantsRepository</code>.
                    </p>
                  </li>
                  <li>
                    <p>
                      If the <code>#dataSourceOpts</code> and its <code
                        >database</code
                      > property are defined (meaning the database creation might
                      have started), it attempts to drop the newly created (but potentially
                      incomplete or corrupted) tenant database using the <code
                        >#runInDefaultDatabase</code
                      > method with the <code
                        >DROP DATABASE ... WITH (FORCE)</code
                      > command. The <code>WITH (FORCE)</code> option is used to
                      ensure the database is dropped even if there are active connections.
                    </p>
                  </li>
                </ul>

                <p>
                  These event handlers are crucial for maintaining the integrity
                  of our multitenant system and providing a clear and responsive
                  onboarding experience for our tenants. They ensure that the
                  control plane is updated with the status of the tenant setup,
                  users are notified upon completion, and failed setups are
                  appropriately logged and cleaned up.
                </p>
              </div>

                <div id="tenant-database-migrations" class="code-snippet">
                  <h3>Tenant Database Migrations</h3>
                <p>
                  Managing database schema changes in our database-per-tenant
                  architecture requires a strategy to ensure consistency across
                  all tenant databases. For our application plane, we've
                  implemented a script that iterates through each active tenant
                  and applies any pending migrations to their individual
                  database.
                </p>
                <p>
                  When this script is executed for the <code>application</code> module,
                  it performs the following steps:
                </p>
                <ul class="sub-list">
                  <li><p>Connects to the control database.</p></li>
                  <li>
                    <p>
                      Retrieves all tenants with an <code>onboardingStatus</code
                      > of
                      <code>Complete</code>.
                    </p>
                  </li>
                  <li>
                    <p>For each active tenant:</p>
                    <ul class="sub-list">
                      <li>
                        <p>
                          Dynamically constructs the database connection options
                          using the tenant's specific <code>databaseHost</code> and
                          generated database name (<code>tenant_</code> + tenant
                          name).
                        </p>
                      </li>
                      <li>
                        <p>
                          Initializes a TypeORM <code>DataSource</code> with these
                          options.
                        </p>
                      </li>
                      <li>
                        <p>
                          Executes the <code>runMigrations()</code> command provided
                          by TypeORM.
                        </p>
                      </li>
                      <li>
                        <p>Destroys the <code>DataSource</code> connection.</p>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <p>
                      Finally, destroys the connection to the control database.
                    </p>
                  </li>
                </ul>
                <pre><code class="language-typescript">
import { join } from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: join(__dirname + '../../../.env'), debug: true })
const readline = require('node:readline')
const { stdin: input, stdout: output } = require('node:process')

const SUPPORTED_MODULES: string[] = ['control', 'application']

const [_, scriptPath, ...args] = process.argv

const cdIntoScriptsPath = "cd " + scriptPath.slice(0, scriptPath.indexOf('/api/')) + "/api/scripts"

import { OnboardingStates } from '../src/control/modules/tenancy/tenants/entities/tenant.entity'
import { parseFlags, runCommand } from './helpers'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { TenantSchema } from '../src/control/modules/tenancy/tenants/schemas/tenant.schema'

class MigrationActions {
 private static errorIfModuleNameNotProvidedOrNotSupported = (moduleName?: string) => {
    if (!moduleName || !SUPPORTED_MODULES.includes(moduleName)) {
      console.error('Provide a valid module name')
      if (moduleName) console.info("Unsupported module: " + moduleName)
      console.info('Available modules are:')
      SUPPORTED_MODULES.forEach((module) => {
        console.log("- " + module)
      })
      process.exit(1)
    }
  }

  private static errorIfMigrationNameNotProvided = (migrationName?: string) => {
    if (!migrationName) {
      console.error('Provide a name for the migration')
      process.exit(1)
    }
  }
  
  public static showHelp() {
    console.info(
      'Usage: npx tsx ./scripts/scriptName migrations [flags] [action] [ generate|create|run|revert ]'
    )
    process.exit(0)
  }
 
 public static async _run([moduleName]: string[] = args) {
    MigrationActions.errorIfModuleNameNotProvidedOrNotSupported(moduleName)
    console.log('Running migrations...')
    const isAppRun = moduleName === 'application'
    if (isAppRun) {
      try {
        const ormconfig = {
          type: 'postgres' as const,
          host: process.env.ENV !== 'production' ? 'localhost' : process.env.DB_HOST,
          port: +process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          autoLoadEntities: true,
          synchronize: false,
          logging: process.env.DB_LOGGING === 'true',
          subscribers: ['dist/**/**/**/*.subscriber{.ts,.js}']
        }

        const controlOrmConfig: PostgresConnectionOptions = {
          ...ormconfig,
          entities: [
            join(__dirname, '../src/control/modules/**/schemas/*.schema{.ts,.js}')
          ],
          migrations: [join(__dirname, '../src/control/migrations/*{.ts,.js}')]
        }

        const tenantOrmConfig: PostgresConnectionOptions = {
          ...ormconfig,
          entities: [
            join(__dirname, '../src/application/modules/**/schemas/*.schema{.ts,.js}')
          ],
          migrations: [join(__dirname, '../src/application/migrations/*{.ts,.js}')]
        }

        const controlConnection = new DataSource(controlOrmConfig)
        await controlConnection.initialize()

        const tenantRepository = controlConnection.getRepository(TenantSchema)
        const tenantsWithDatabase = await tenantRepository.findBy({
          onboardingStatus: OnboardingStates.Complete
        })

        for (const tenant of tenantsWithDatabase) {
          const dataSourceOpts: PostgresConnectionOptions = {
            ...tenantOrmConfig,
            host: process.env.ENV !== 'production' ? 'localhost' : tenant.databaseHost,
            database: "tenant_" + tenant.name
          }
          const tenantDataSource = await new DataSource(dataSourceOpts).initialize()
          await tenantDataSource.runMigrations()
          await tenantDataSource.destroy()
        }
        await controlConnection.destroy()
      } catch (err) {
        console.error(err)
        throw err
      }
    } else {

      // Run control migrations, there are many ways to do this, and depends on how you host your app

    }
  }

  // Note that the same principle is used for running migration revertions, this will be skipped here

  // Also, migrations are generated locally but you could implement more complex ways to do it should you have the need

  // We do have generation and creation methods but those will also be skipped.
}

const actions = {
  generate: MigrationActions._generate,
  g: MigrationActions._generate,
  create: MigrationActions._create,
  c: MigrationActions._create,
  run: MigrationActions._run,
  revert: MigrationActions._revert
}

const { flags, newArgs } = parseFlags(args)

const action = newArgs[0]
newArgs.shift()

actions[action] ? actions[action](newArgs, flags) : MigrationActions.showHelp()

const rl = readline.createInterface({ input, output })
output.write('\n')
rl.question('Press Enter to exit \n', () => {
  rl.close()
  console.log('\nBye!\n')
  process.exit(0)
})
                </code></pre>
                <p>
                  As highlighted in the code, when the <code>application</code> module
                  is targeted, we establish a connection to the control database
                  to fetch all fully onboarded tenants. For each of these tenants,
                  we dynamically create a TypeORM <code>DataSource</code> pointed
                  to their specific database. We then execute the <code
                    >runMigrations()</code
                  > command to apply any pending schema changes. This ensures that
                  each tenant's database schema is independently managed and up-to-date.
                </p>
                <p>
                  For managing migrations in the <code>control</code> plane, we have
                  a separate process (the details of which are omitted here for brevity
                  but often involve using the TypeORM CLI). The same principle of
                  iterating through tenants and applying changes can be extended
                  if your control plane also has tenant-specific data.
                </p>
                <p>
                  It's important to note that the logic for reverting migrations
                  and generating new ones follows a similar pattern but is not
                  included in this simplified example. In our workflow,
                  migrations are typically generated locally during development.
                </p>
                <p>
                  It's also worth noting that the _run method can be easily
                  extended to support more granular control over which tenants
                  receive migrations. For instance, you could add flags or
                  arguments to the script to filter tenants based on their ID,
                  status, or other criteria, although this level of specificity
                  wasn't a requirement for our initial implementation.
                </p>
                <p>
                  <strong>Environment Configuration:</strong>
                </p>
                <p>
                  The migration script relies on environment variables (loaded
                  using <code>dotenv</code>) to establish connections to both
                  the control database and the individual tenant databases. <strong
                    >Therefore, it is paramount to configure these variables
                    accurately for each environment (development, testing,
                    staging, production).</strong
                  >
                  This includes details such as database hosts, ports, usernames,
                  and passwords. Inconsistent or incorrect configurations can result
                  in failed migrations or unintended data modifications.
                </p>
                </div>
                </div>
                <div id="closing-thoughts">
              <h1>Closing thoughts</h1>
              <p>
                Implementing a robust multi-tenant Software-as-a-Service (SaaS)
                application presents a fascinating set of architectural
                challenges. As we've explored in this post, our decision to
                adopt a database-per-tenant strategy, implemented with the power
                of NestJS offers significant advantages in terms of tenant data
                isolation and the potential for granular scalability. The
                seamless integration of TypeORM with PostgreSQL has been
                instrumental in managing our database interactions and ensuring
                data integrity across tenants. However, it's crucial to
                acknowledge that this approach is not without its complexities
                and trade-offs. Managing a larger number of databases can
                increase operational overhead, including backups, maintenance,
                and potential resource consumption. Initial setup and tenant
                onboarding require careful orchestration, as demonstrated by our
                asynchronous queue-based implementation using BullMQ.
                Furthermore, cross-tenant queries and analytics can become more
                intricate, often requiring distributed query mechanisms or data
                aggregation strategies. The landscape of multitenancy is broad,
                with various patterns and considerations beyond the scope of
                this single post. We encourage you to view our implementation as
                a starting point and to explore other strategies that might
                better suit your specific application requirements and scale.
                Concepts like shared databases with tenant identifiers,
                schema-based isolation, and even more advanced techniques like
                data sharding offer alternative paths worth investigating. To
                deepen your understanding of the technologies and concepts
                discussed, we highly recommend exploring the official
                documentation for
                <a href="https://docs.nestjs.com/">NestJS</a> and <a
                  href="https://orkhan.gitbook.io/typeorm/docs">TypeORM</a
                >. Additionally, Tod Golding's book, "Building Multi-tenant SaaS
                Architectures", provides a broader theoretical foundation for
                SaaS architecture and multitenancy patterns. <a
                  href="https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/"
                  >Thomas Vanderstraeten's blog post</a
                > offers a valuable complementary perspective on database-level tenant
                isolation. We hope this detailed exploration of our database-per-tenant
                implementation has provided you with practical insights and a solid
                foundation for your own multi-tenant journey. Thank you for taking
                the time to delve into our approach.
              </p>
            </div>
          </div>
          `;

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(Post).values({
    slug: "multi-tenant-saas-architecture",
    createdAt: new Date(),
  });

  await db.insert(PostContent).values([
    {
      postId: 1,
      lang: "en",
      title:
        "Multi-tenant SaaS Architecture with NestJS, TypeORM and PostgreSQL",
      description:
        "A deep dive into building scalable multi-tenant applications with a database-per-tenant strategy.",
      content: enPostContent,
    },
    {
      postId: 1,
      lang: "es",
      title:
        "Arquitectura Saas para multiples tenants con NestJS, TypeORM and PostgreSQL",
      description:
        "Una exploración a fondo sobre cómo construir una aplicación multi-tenant escalable utilizando NestJS, TypeORM y PostgreSQL, empleando una estrategia de base de datos por tenant.",
      content: esPostContent,
    },
  ]);
}
