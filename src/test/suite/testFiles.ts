export interface MyTest {
     initial: string;
     expected: string;
};

export const noPropertiesBlock: MyTest = {
     initial: `<project>
    <dependencies>
        <dependency>
            <groupId>org.springframework.retry</groupId>
            <artifactId>spring-retry</artifactId>
            <version>2.0.13</version>
        </dependency>
    </dependencies>
</project>`,

     expected: `<project>
    <properties>
        <spring-retry.version>2.0.13</spring-retry.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.retry</groupId>
            <artifactId>spring-retry</artifactId>
            <version>\${spring-retry.version}</version>
        </dependency>
    </dependencies>
</project>`
};

export const appendToExistingPropertiesBlock: MyTest = {
     initial: `<project>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-ui</artifactId>
            <version>3.0.1</version>
        </dependency>
    </dependencies>
</project>`,

     expected: `<project>
    <properties>
        <java.version>17</java.version>
        <springdoc-ui.version>3.0.1</springdoc-ui.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-ui</artifactId>
            <version>\${springdoc-ui.version}</version>
        </dependency>
    </dependencies>
</project>`
};

export const versionPropertyExistsUserChangeToExistingProperty: MyTest = {
     initial: `<project>
    <properties>
        <spring-retry.version>1.95.0</spring-retry.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.retry</groupId>
            <artifactId>spring-retry</artifactId>
            <version>2.0.13</version>
        </dependency>
    </dependencies>
</project>`,

     expected: `<project>
    <properties>
        <spring-retry.version>1.95.0</spring-retry.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.retry</groupId>
            <artifactId>spring-retry</artifactId>
            <version>\${spring-retry.version}</version>
        </dependency>
    </dependencies>
</project>`
};

export const versionPropertyExistsUserEntersNewName: MyTest = {
     initial: `<project>
    <properties>
        <spring-retry.version>1.95.0</spring-retry.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.retry</groupId>
            <artifactId>spring-retry</artifactId>
            <version>2.0.13</version>
        </dependency>
    </dependencies>
</project>`,

     expected: `<project>
    <properties>
        <spring-retry.version>1.95.0</spring-retry.version>
        <spring-retry-me.version>2.0.13</spring-retry-me.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.retry</groupId>
            <artifactId>spring-retry</artifactId>
            <version>\${spring-retry-me.version}</version>
        </dependency>
    </dependencies>
</project>`
};