import { db, Comment, CommentReply, Post, PostContent } from "astro:db";

const postcontentstr = String.raw`<p>
            This is heavily inspired by <a
              href="https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/"
              target="_blank"
              rel="noopener noreferrer">Thomas Vanderstraeten's take</a
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
    id: 1,
    slug: "multi-tenant-saas-architecture",
    createdAt: new Date(),
  });

  await db.insert(PostContent).values({
    id: 1,
    postId: 1,
    lang: "en",
    title: "Multi-tenant SaaS Architecture with NestJS, TypeORM and PostgreSQL",
    description:
      "A deep dive into building a scalable multi-tenant application with NestJS, TypeORM and PostgreSQL for a database-per-tenant strategy.",
    content: postcontentstr,
  });

  await db.insert(Comment).values([
    ...Array.from({ length: 5 }).map((_v, i) =>
      i === 4
        ? {
            id: 20,
            author: "A COMMENTER",
            body: "A COMMENT WITH EXACTLY TWO REPLIES",
            createdAt: new Date(),
            postId: 1,
          }
        : {
            id: i++,
            author: "Brian" + i,
            body: "some comment" + i++,
            createdAt: new Date(),
            postId: 1,
          }
    ),
    {
      id: 21,
      author: "A REPLIER",
      body: "A REPLY",
      createdAt: new Date(),
      postId: 1,
    },
    {
      id: 22,
      author: "A SECOND REPLIER",
      body: "A SECOND REPLY",
      createdAt: new Date(),
      postId: 1,
    },
    {
      id: 23,
      author: "A REPLIER TO SECOND REPLIER",
      body: "A REPLY TO SECOND REPLY",
      createdAt: new Date(),
      postId: 1,
    },
  ]);

  await db.insert(CommentReply).values([
    {
      id: 1,
      originalCommentId: 20,
      comment: 21,
    },
    {
      id: 2,
      originalCommentId: 20,
      comment: 22,
    },
    {
      id: 3,
      originalCommentId: 22,
      comment: 23,
    },
  ]);
}
